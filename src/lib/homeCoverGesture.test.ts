import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyHomeCoverSwipe,
  normalizeHomeCoverWheelDelta,
  normalizeHomeCoverWheelIntent,
  resolveHomeCoverDirection,
  resolveHomeCoverProgress,
  resolveHomeCoverRelease,
  resolveHomeCoverSettleDuration,
  resolveHomeCoverTakeover,
  resolveHomeCoverTarget,
} from './homeCoverGesture.ts';

test('统一意图以正值展开、负值收回', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 4, intentDistance: 56, elapsedMs: 320, progress: 0 }), 'expand');
  assert.equal(classifyHomeCoverSwipe({ deltaX: -3, intentDistance: -56, elapsedMs: 320, progress: 1 }), 'collapse');
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, intentDistance: -60, elapsedMs: 320, progress: 0 }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, intentDistance: 60, elapsedMs: 320, progress: 1 }), null);
});

test('快速轻扫仍需达到最小位移', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 2, intentDistance: 20, elapsedMs: 160, progress: 0 }), 'expand');
  assert.equal(classifyHomeCoverSwipe({ deltaX: 1, intentDistance: 19, elapsedMs: 10, progress: 0 }), null);
});

test('横向、多点取消和低速短滑不会误触', () => {
  assert.equal(classifyHomeCoverSwipe({ deltaX: 50, intentDistance: 40, elapsedMs: 80, progress: 0 }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, intentDistance: 80, elapsedMs: 180, progress: 0, cancelled: true }), null);
  assert.equal(classifyHomeCoverSwipe({ deltaX: 0, intentDistance: 30, elapsedMs: 300, progress: 0 }), null);
});

test('方向锁在 12px 后按 1.25 纵横比判定', () => {
  assert.equal(resolveHomeCoverDirection(2, 11), null);
  assert.equal(resolveHomeCoverDirection(8, 13), 'vertical');
  assert.equal(resolveHomeCoverDirection(16, 8), 'horizontal');
  assert.equal(resolveHomeCoverDirection(12, 12), null);
});

test('拖动进度从任意当前值逐帧跟随并限制在 0..1', () => {
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.2, intentDelta: 60, travelDistance: 200 }), 0.5);
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.8, intentDelta: -60, travelDistance: 200 }), 0.5);
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.9, intentDelta: 80, travelDistance: 200 }), 1);
  assert.equal(resolveHomeCoverProgress({ startProgress: 0.1, intentDelta: -80, travelDistance: 200 }), 0);
});

test('仅主页顶部接管收起态展开，展开态与中间态支持全局反向', () => {
  const base = { isHomeRoute: true, clientY: 120, headerHeight: 81 };
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 40, progress: 0, intentDelta: 20 }), false);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 1, progress: 0, intentDelta: 20 }), true);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 0, progress: 0, intentDelta: 20, freshInput: false }), false);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 0, progress: 0, intentDelta: -20 }), false);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 0, progress: 1, intentDelta: -20 }), true);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 0, progress: 1, intentDelta: 20 }), false);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 0, progress: 0.5, intentDelta: -20 }), true);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 0, progress: 0.5, intentDelta: 20 }), true);
  assert.equal(resolveHomeCoverTakeover({ ...base, pageScrollY: 0, progress: 0, intentDelta: 20, clientY: 40 }), false);
  assert.equal(resolveHomeCoverTakeover({ ...base, isHomeRoute: false, pageScrollY: 0, progress: 0, intentDelta: 20 }), false);
});

test('拖拽可从当前进度按速度或中点结算并反向', () => {
  assert.equal(resolveHomeCoverTarget({ progress: 0.2, intentDistance: 20, elapsedMs: 160 }), 1);
  assert.equal(resolveHomeCoverTarget({ progress: 0.8, intentDistance: -20, elapsedMs: 160 }), 0);
  assert.equal(resolveHomeCoverTarget({ progress: 0.51, intentDistance: 8, elapsedMs: 160 }), 1);
  assert.equal(resolveHomeCoverTarget({ progress: 0.49, intentDistance: -8, elapsedMs: 160 }), 0);
  assert.equal(resolveHomeCoverTarget({ progress: 0.8, intentDistance: 0, elapsedMs: 1, cancelled: true }), 1);
  assert.equal(resolveHomeCoverTarget({ progress: 0.2, intentDistance: 0, elapsedMs: 1, cancelled: true }), 0);
});

test('释放结果包含带方向速度、目标和剩余距离结算时长', () => {
  assert.deepEqual(resolveHomeCoverRelease({ progress: 0.25, deltaX: 2, intentDistance: 20, elapsedMs: 100 }), {
    progress: 0.25,
    velocity: 0.2,
    target: 1,
    durationMs: 215,
  });
  assert.deepEqual(resolveHomeCoverRelease({ progress: 0.75, deltaX: 2, intentDistance: -20, elapsedMs: 100 }), {
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
  assert.equal(resolveHomeCoverRelease({ progress: 0.7, intentDistance: 90, elapsedMs: 100, cancelled: true }).target, 1);
  assert.equal(resolveHomeCoverRelease({ progress: 0.3, intentDistance: -90, elapsedMs: 100, cancelled: true }).target, 0);
  assert.equal(resolveHomeCoverRelease({ progress: 0.7, intentDistance: 0, elapsedMs: 1, reduceMotion: true }).durationMs, 0);
});

test('桌面滚轮归一化为与触摸一致的展开意图', () => {
  assert.equal(normalizeHomeCoverWheelDelta(-120, 0, 900), -120);
  assert.equal(normalizeHomeCoverWheelDelta(-3, 1, 900), -48);
  assert.equal(normalizeHomeCoverWheelDelta(1, 2, 900), 900);
  assert.equal(normalizeHomeCoverWheelIntent(-120, 0, 900), 120);
  assert.equal(normalizeHomeCoverWheelIntent(120, 0, 900), -120);
});
