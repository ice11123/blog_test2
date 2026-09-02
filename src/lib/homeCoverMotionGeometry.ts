export interface MotionRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface HomeCoverMotionGeometryInput {
  sourceRect: MotionRect;
  stageRect: MotionRect;
  imageWidth: number;
  imageHeight: number;
  objectPositionX: number;
  objectPositionY: number;
  headerHeight: number;
  toggleHeight: number;
}

export interface HomeCoverMotionGeometry {
  coverScale: number;
  coverX: number;
  coverY: number;
  containScale: number;
  containX: number;
  containY: number;
  clipTop: number;
  clipRight: number;
  clipBottom: number;
  clipLeft: number;
  drawerDistance: number;
  handleX: number;
  handleY: number;
}

export function computeHomeCoverMotionGeometry(
  input: HomeCoverMotionGeometryInput,
): HomeCoverMotionGeometry {
  const imageWidth = Math.max(input.imageWidth, 1);
  const imageHeight = Math.max(input.imageHeight, 1);
  const stageWidth = Math.max(input.stageRect.width, 1);
  const stageHeight = Math.max(input.stageRect.height, 1);
  const coverScale = Math.max(input.sourceRect.width / imageWidth, input.sourceRect.height / imageHeight);
  const containScale = Math.min(stageWidth / imageWidth, stageHeight / imageHeight);
  const targetHandleX = input.stageRect.left + stageWidth / 2;
  const targetHandleY = input.headerHeight + 16 + input.toggleHeight / 2;

  return {
    coverScale,
    coverX: input.sourceRect.left - input.stageRect.left
      + (input.sourceRect.width - imageWidth * coverScale) * input.objectPositionX,
    coverY: input.sourceRect.top - input.stageRect.top
      + (input.sourceRect.height - imageHeight * coverScale) * input.objectPositionY,
    containScale,
    containX: (stageWidth - imageWidth * containScale) / 2,
    containY: (stageHeight - imageHeight * containScale) / 2,
    clipTop: Math.max(input.sourceRect.top - input.stageRect.top, 0),
    clipRight: Math.max(input.stageRect.right - input.sourceRect.right, 0),
    clipBottom: Math.max(input.stageRect.bottom - input.sourceRect.bottom, 0),
    clipLeft: Math.max(input.sourceRect.left - input.stageRect.left, 0),
    drawerDistance: Math.max(input.stageRect.bottom - input.sourceRect.bottom, 0),
    handleX: input.sourceRect.left + input.sourceRect.width / 2 - targetHandleX,
    handleY: input.sourceRect.top + 16 + input.toggleHeight / 2 - targetHandleY,
  };
}
