import test from 'node:test';
import assert from 'node:assert/strict';
import { createHomeCoverTimeline } from './homeCoverTimeline.ts';
import { computeHomeCoverMotionGeometry } from './homeCoverMotionGeometry.ts';

function setup() {
  const animations: any[] = [];
  const element = () => ({
    style: { removeProperty() {}, willChange: '' }, querySelector: () => null,
    animate(frames: Keyframe[], options: KeyframeAnimationOptions) {
      const animation = { frames, options, currentTime: 0, cancelled: false,
        pause() {}, cancel() { this.cancelled = true; }, finished: new Promise<void>(() => {}) };
      animations.push(animation);
      return animation;
    },
  });
  const stage = element(), viewport = element(), fullImage = element(), drawer = element(), toggle = element();
  const timeline = createHomeCoverTimeline({ stage, viewport, fullImage, drawer, toggle } as any);
  const geometry = computeHomeCoverMotionGeometry({
    sourceRect: { top: 80, bottom: 600, left: 0, right: 1440, width: 1440, height: 520 },
    stageRect: { top: 80, bottom: 900, left: 240, right: 1440, width: 1200, height: 820 },
    imageWidth: 1920, imageHeight: 1080, objectPositionX: .5, objectPositionY: .5, headerHeight: 80, toggleHeight: 44,
  });
  timeline.rebuild({ geometry, imageWidth: 1920, imageHeight: 1080 });
  return { timeline, animations };
}

test('壁纸时间线统一进度、反向采样与释放所有合成提示', () => {
  const { timeline, animations } = setup();
  assert.equal(animations.length, 5);
  timeline.seek(.37);
  assert.equal(timeline.sample(0), .37);
  timeline.settle(.37, 1, 280);
  animations[5].currentTime = 140;
  const interrupted = timeline.sample(0);
  assert.ok(interrupted > .37 && interrupted < 1);
  timeline.cancelSettle();
  timeline.seek(interrupted);
  assert.equal(timeline.sample(0), interrupted);
  timeline.settle(interrupted, 0, 240);
  assert.equal(animations[10].options.duration, 240);
  timeline.dispose();
  assert.ok(animations.every(animation => animation.cancelled));
  assert.equal(timeline.hasAnimations(), false);
  assert.equal(timeline.hasTracks(), false);
});

test('重建只保留一套时间线，避免快速尺寸变更泄漏动画', () => {
  const { timeline, animations } = setup();
  timeline.dispose();
  assert.equal(timeline.sample(.5), .5);
  assert.ok(animations.every(animation => animation.cancelled));
});
