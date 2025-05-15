import { v4 as uuidV4 } from "uuid";

export const preprocessShapeList = (shapeList) => {
  if (!Array.isArray(shapeList)) {
    console.error("Invalid shapeList:", shapeList);
    return [];
  }

  return shapeList.map((shape) =>
    Array.isArray(shape)
      ? shape.map((point) => ({
          x: parseFloat(point.x),
          y: parseFloat(point.y),
        }))
      : []
  );
};

export const processedManualShapesList = (manualCoordinates) => {
  if (!Array.isArray(manualCoordinates)) {
    console.error("Invalid manualCoordinates:", manualCoordinates);
    return [];
  }

  return manualCoordinates.map((shape) =>
    Array.isArray(shape)
      ? shape.map((point) => ({
          x: parseFloat(point.x),
          y: parseFloat(point.y),
          width: point.width,
          height: point.height,
        }))
      : []
  );
};

export const getAnnotationModel = (imageCoordinate) => {
  const annotation = {
    id: uuidV4(),
    target: {
      selector: {
        type: "RECTANGLE",
        geometry: {
          bounds: {
            minX: imageCoordinate.x,
            minY: imageCoordinate.y,
            maxX: imageCoordinate.x + imageCoordinate.width,
            maxY: imageCoordinate.y + imageCoordinate.height,
          },
          x: imageCoordinate.x,
          y: imageCoordinate.y,
          w: imageCoordinate.width,
          h: imageCoordinate.height,
        },
      },
    },
  };
  return annotation;
};
