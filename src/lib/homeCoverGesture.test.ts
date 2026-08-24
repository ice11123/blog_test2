import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyHomeCoverSwipe,
  resolveHomeCoverDirection,
  resolveHomeCoverProgress,
  resolveHomeCoverRelease,
  resolveHomeCoverSettleDuration,
  resolveHomeCoverTarget,
  normalizeHomeCoverWheelDelta,
  resolveHomeCoverWheelTarget,
} from './homeCoverGesture.ts';

test('主页壁纸按方向展开和收回', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 4, deltaY: -56, elapsedMs: 320, expanded: false }), 'expand');
  assert.equal(classifyHomeCoverSwipe({ deltaX: -3, deltaY: 56, elapsedMs: 320, expanded: true }), 'collapse');
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: 60, elapsedMs: 320, expanded: false }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: -60, elapsedMs: 320, expanded: true }), null);
});

test('快速轻扫仍需达到最小位移', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 2, deltaY: -20, elapsedMs: 160, expanded: false }), 'expand');
  assert.equal(classifyHomeCoverSwipe({ deltaX: 1, deltaY: -19, elapsedMs: 10, expanded: false }), null);
});

test('横向、多点取消和低速短滑不会误触', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 50, deltaY: -40, elapsedMs: 80, expanded: false }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: -80, elapsedMs: 180, expanded: false, cancelled: true }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, deltaY: -30, elapsedMs: 300, expanded: false }), null);
});

test('方向锁在 12px 后按 1.25 纵横比判定', () => {
  assert.equal(resolveHomeCoverDirection(2, -11), null);
  assert.equal(resolveHomeCoverDirection(8, -13), 'vertical');
  assert.equal(resolveHomeCoverDirection(16, -8), 'horizontal');
  assert.equal(resolveHomeCoverDirection(12, -12), null);
});

test('拖动进度从任意当前值逐帧跟随并限制在 0..1', () => {
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.2, deltaY: -60, travelDistance: 200 }), 0.5);
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.8, deltaY: 60, travelDistance: 200 }), 0.5);
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.9, deltaY: -80, travelDistance: 200 }), 1);
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.1, deltaY: 80, travelDistance: 200 }), 0);
});

test('拖拽可从当前进度按速度或中点结算并反向', () => {
  assert.equal(resolveHomeCoverTarget({ progress: 0.2, deltaY: -20, elapsedMs: 160 }), 1);
  assert.equal(resolveHomeCoverTarget({ progress: 0.8, deltaY: 20, elapsedMs: 160 }), 0);
  assert.equal(resolveHomeCoverTarget({ progress: 0.51, deltaY: -8, elapsedMs: 160 }), 1);
  assert.equal(resolveHomeCoverTarget({ progress: 0.49, deltaY: 8, elapsedMs: 160 }), 0);
  assert.equal(resolveHomeCoverTarget({ progress: 0.8, deltaY: 0, elapsedMs: 1, cancelled: true }), 1);
  assert.equal(resolveHomeCoverTarget({ progress: 0.2, deltaY: 0, elapsedMs: 1, cancelled: true }), 0);
});

test('释放结果包含带方向速度、目标和剩余距离结算时长', () => {
  assert.deepEqual(resolveHomeCoverRelease({ progress: 0.25, deltaX: 2, deltaY: -20, elapsedMs: 100 }), {
    progress: 0.25,
    velocity: 0.2,
    target: 1,
    durationMs: 215,
  });
  assert.deepEqual(resolveHomeCoverRelease({ progress: 0.75, deltaX: 2, deltaY: 20, elapsedMs: 100 }), {
    progress: 0.75,
    velocity: -0.2,
    target: 0,
    durationMs: 215,
  });
  assert.equal(resolveHomeCoverSettleDuration(0.8, 1), 160);
  assert.equal(resolveHomeCoverSettleDuration(0.2, 0), 160);
  assert.equal(resolveHomeCoverSettleDuration(0.4, 1, true), 0);
});

test('指针取消回到最近端点，降低动态立即结算', () => {
  assert.equal(resolveHomeCoverRelease({ progress: 0.7, deltaY: -90, elapsedMs: 100, cancelled: true }).target, 1);
  assert.equal(resolveHomeCoverRelease({ progress: 0.3, deltaY: 90, elapsedMs: 100, cancelled: true }).target, 0);
  assert.equal(resolveHomeCoverRelease({ progress: 0.7, deltaY: 0, elapsedMs: 1, reduceMotion: true }).durationMs, 0);
});

test('桌面滚轮按方向和累计阈值展开或收回', () => {
  assert.equal(resolveHomeCoverWheelTarget(-39, false), null);
  assert.equal(resolveHomeCoverWheelTarget(-40, false), 1);
  assert.equal(resolveHomeCoverWheelTarget(40, true), 0);
  assert.equal(resolveHomeCoverWheelTarget(80, false), null);
  assert.equal(resolveHomeCoverWheelTarget(-80, true), null);
});

test('滚轮按像素、行和页面模式统一归一化', () => {
  assert.equal(normalizeHomeCoverWheelDelta(-120, 0, 900), -120);
  assert.equal(normalizeHomeCoverWheelDelta(-3, 1, 900), -48);
  assert.equal(normalizeHomeCoverWheelDelta(1, 2, 900), 900);
});
