import assert from 'node:assert/strict';
import test from 'node:test';
import { computeHomeCoverMotionGeometry } from './homeCoverMotionGeometry.ts';

test('壁纸几何把封面 cover 连续映射到舞台 contain', () => {
  const geometry = computeHomeCoverMotionGeometry({
    sourceRect: { top: 80, right: 1200, bottom: 680, left: 200, width: 1000, height: 600 },
    stageRect: { top: 80, right: 1200, bottom: 800, left: 200, width: 1000, height: 720 },
    imageWidth: 2000,
    imageHeight: 1000,
    objectPositionX: 0.5,
    objectPositionY: 0.5,
    headerHeight: 80,
    toggleHeight: 44,
  });

  assert.equal(geometry.coverScale, 0.6);
  assert.equal(geometry.containScale, 0.5);
  assert.equal(geometry.coverX, -100);
  assert.equal(geometry.coverY, 0);
  assert.equal(geometry.containX, 0);
  assert.equal(geometry.containY, 110);
  assert.equal(geometry.drawerDistance, 120);
  assert.equal(geometry.viewportX, 0);
  assert.equal(geometry.viewportY, 0);
  assert.equal(geometry.viewportScaleX, 1);
  assert.equal(geometry.viewportScaleY, 5 / 6);
  assert.equal(geometry.handleX, 0);
  assert.equal(geometry.handleY, 0);
});

test('裁切视口使用位移和非等比缩放精确复现封面边界', () => {
  const geometry = computeHomeCoverMotionGeometry({
    sourceRect: { top: 120, right: 1080, bottom: 620, left: 280, width: 800, height: 500 },
    stageRect: { top: 80, right: 1280, bottom: 800, left: 200, width: 1080, height: 720 },
    imageWidth: 1920,
    imageHeight: 1080,
    objectPositionX: 0.54,
    objectPositionY: 0.55,
    headerHeight: 80,
    toggleHeight: 44,
  });

  assert.equal(geometry.viewportX, 80);
  assert.equal(geometry.viewportY, 40);
  assert.equal(geometry.viewportScaleX, 800 / 1080);
  assert.equal(geometry.viewportScaleY, 500 / 720);
});
