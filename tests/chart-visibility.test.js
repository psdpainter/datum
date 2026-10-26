import test from 'node:test';
import assert from 'node:assert/strict';
import { Datum } from '../src/datum.js';

class Element {
  children = [];
  attributes = {};
  style = { setProperty() {}, removeProperty(name) { delete this[name]; } };
  setAttribute(name, value) { this.attributes[name] = String(value); }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  addEventListener() {}
  querySelectorAll(selector) {
    const name = selector.slice(1);
    return this.children.flatMap(child => [
      ...(child.attributes.class?.split(' ').includes(name) ? [child] : []),
      ...child.querySelectorAll(selector)
    ]);
  }
}
globalThis.document = { createElement: () => new Element(), createElementNS: () => new Element() };

function chart(options = {}) {
  return Datum.chart({
    target: new Element(), width: 600, height: 360, tooltip: false,
    datum: [Datum.line([1, 3, 2])], ...options,
    config: { legend: false, ...options.config }
  });
}
const count = (base, name) => base.svg.querySelectorAll(`.${name}`).length;

test('bar gradients fade each fill color from configured opacity to transparent', () => {
  for (const stacked of [false, true]) {
    const options = { gradient: true, opacity: 0.6, fill: (_, i) => i === 1 ? 'red' : 'blue', stackId: stacked ? 'total' : null };
    const base = chart({ datum: [Datum.bar([1, 2, 3], options), Datum.bar([2, 3, 4], options)] });
    const layers = base.svg.querySelectorAll('.datum-layer-bar');
    const ids = new Set();
    for (const layer of layers) {
      const [defs, ...bars] = layer.children;
      assert.equal(defs.children.length, 2);
      for (const gradient of defs.children) {
        assert.equal(gradient.attributes.y1, '0%');
        assert.equal(gradient.attributes.y2, '100%');
        assert.equal(gradient.attributes.x1, gradient.attributes.x2);
        assert.deepEqual(gradient.children.map(stop => stop.attributes['stop-opacity']), ['0.6', '0']);
        assert.deepEqual(gradient.children.map(stop => stop.attributes.offset), ['0%', '100%']);
        assert.ok(!ids.has(gradient.attributes.id));
        ids.add(gradient.attributes.id);
      }
      assert.equal(bars[0].attributes.fill, `url(#${defs.children[0].attributes.id})`);
      assert.equal(bars[1].attributes.fill, `url(#${defs.children[1].attributes.id})`);
      assert.equal(bars[2].attributes.fill, bars[0].attributes.fill);
      assert.equal(bars[0].attributes.opacity, undefined);
      assert.equal(defs.children[0].children[0].attributes['stop-color'], 'blue');
      assert.equal(defs.children[1].children[0].attributes['stop-color'], 'red');
    }
  }
  const solid = chart({ datum: [Datum.bar([1], { fill: 'blue', opacity: 0.6 })] });
  const rect = solid.svg.querySelectorAll('.datum-layer-bar')[0].children[0];
  assert.equal(rect.attributes.fill, 'blue');
  assert.equal(rect.attributes.opacity, '0.6');
});

test('visibility options are independent for every combination', () => {
  for (const background of [true, false]) {
    for (const xAxis of [true, false]) {
      for (const yAxis of [true, false]) {
        const base = chart({ config: { background, xAxis, yAxis } });
        assert.equal(count(base, 'datum-axis-x'), Number(xAxis));
        assert.equal(count(base, 'datum-axis-y'), Number(yAxis));
        assert.equal(count(base, 'datum-grid'), Number(background));
        assert.equal(count(base, 'datum-layer-line'), 1);
        if (!background) {
          assert.equal(base.svg.style.background, 'transparent');
          assert.equal(base.container.style.background, 'transparent');
        }
      }
    }
  }
});

test('clean overrides explicit visibility and matches all three false options', () => {
  const clean = chart({ clean: true, config: { background: true, xAxis: true, yAxis: true } });
  const explicit = chart({ config: { background: false, xAxis: false, yAxis: false } });
  const snapshot = node => ({ attributes: node.attributes, children: node.children.map(snapshot) });
  assert.deepEqual(snapshot(clean.svg), snapshot(explicit.svg));
  assert.equal(count(clean, 'datum-axis'), 0);
  assert.equal(count(clean, 'datum-grid'), 0);
});

test('defaults and axis object configuration remain supported', () => {
  const base = chart({ config: { xAxis: { interval: 2 }, yAxis: { min: 0, max: 10 } } });
  assert.equal(count(base, 'datum-axis'), 2);
  assert.equal(count(base, 'datum-grid'), 1);
  assert.equal(count(base, 'datum-axis-text-x'), 2);
});

test('includeAxisLines hides only the axis boundary lines and defaults to true', () => {
  const defaults = chart();
  const enabled = chart({ config: { includeAxisLines: true } });
  const disabled = chart({ config: { includeAxisLines: false } });
  assert.equal(count(defaults, 'datum-axis-line'), 2);
  assert.equal(count(enabled, 'datum-axis-line'), 2);
  assert.equal(count(disabled, 'datum-axis-line'), 0);
  const snapshot = node => ({
    attributes: node.attributes,
    children: node.children
      .filter(child => child.attributes.class !== 'datum-axis-line')
      .map(snapshot)
  });
  assert.deepEqual(snapshot(disabled.svg), snapshot(defaults.svg));
});

const yTicks = base => base.svg.querySelectorAll('.datum-axis-text-y')
  .map(label => Number(label.textContent.replaceAll(',', '')));

test('nonnegative data starts the y-axis at zero', () => {
  for (const values of [[0, 30, 1], [10, 20, 30], [0, 0, 0], [5, 5, 5]]) {
    const ticks = yTicks(chart({ datum: [Datum.line(values)] }));
    assert.equal(ticks[0], 0);
    assert.ok(ticks.at(-1) >= Math.max(...values));
  }
});

test('negative data remains visible with automatic bounds', () => {
  const ticks = yTicks(chart({ datum: [Datum.line([-10, 0, 30])] }));
  assert.ok(ticks[0] <= -10);
  assert.ok(ticks.at(-1) >= 30);
});

test('explicit y-axis bounds override the automatic zero baseline', () => {
  for (const bounds of [{ min: -5, max: 40 }, { min: 10, max: 40 }, { min: -5 }, { max: 40 }]) {
    const ticks = yTicks(chart({ datum: [Datum.line([10, 20, 30])], config: { yAxis: bounds } }));
    assert.equal(ticks[0], bounds.min ?? 0);
    if (bounds.max !== undefined) assert.equal(ticks.at(-1), bounds.max);
  }
});
