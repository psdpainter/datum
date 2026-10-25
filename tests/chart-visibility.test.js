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
