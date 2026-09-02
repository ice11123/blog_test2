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
  assert.deepEqual(
    [geometry.clipTop, geometry.clipRight, geometry.clipBottom, geometry.clipLeft],
    [0, 0, 120, 0],
  );
  assert.equal(geometry.handleX, 0);
  assert.equal(geometry.handleY, 0);
});
