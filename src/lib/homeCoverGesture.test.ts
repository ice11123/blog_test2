import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyHomeCoverSwipe } from './homeCoverGesture.ts';

test('主页壁纸按方向展开和收回', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 4, deltaY: -56, elapsedMs: 320, expanded: false }), 'expand');
  assert.equal(classifyHomeCoverSwipe({ deltaX: -3, deltaY: 56, elapsedMs: 320, expanded: true }), 'collapse');
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: 60, elapsedMs: 320, expanded: false }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: -60, elapsedMs: 320, expanded: true }), null);
});

test('快速轻扫仍需达到最小位移', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 2, deltaY: -20, elapsedMs: 30, expanded: false }), 'expand');
  assert.equal(classifyHomeCoverSwipe({ deltaX: 1, deltaY: -19, elapsedMs: 10, expanded: false }), null);
});

test('横向、多点取消和低速短滑不会误触', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 50, deltaY: -40, elapsedMs: 80, expanded: false }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: -80, elapsedMs: 180, expanded: false, cancelled: true }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: -30, elapsedMs: 300, expanded: false }), null);
});
