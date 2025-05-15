import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import OpenSeadragon from "openseadragon";

import {
  preprocessShapeList,
  processedManualShapesList,
  getAnnotationModel,
} from "./utils";

const Overlay = ({
  shapeList,
  openSeadragon,
  manualCoordinates,
  annotationCoordinates,
  annotoriousInstance,
  setCurrentAnnotation,
}) => {
  const [processedShapeList, setProcessedShapeList] = useState([]);
  const [processedManualShapeList, setProcessedManualShapeList] = useState([]);
  const [annotations, setAnnotations] = useState([]);

  annotoriousInstance?.current?.on("createAnnotation", (annotation) => {
    if (annotation?.id) {
      const annotationIndex = annotations?.findIndex(
        (ann) => ann?.id === annotation?.id
      );

      if (annotationIndex === -1) {
        const currentAnno = {
          id: annotation?.id,
          target: annotation?.target,
        };
        setCurrentAnnotation(() => currentAnno);
        const annoList = annotations;
        annoList?.push(currentAnno);
        setAnnotations(annoList);
        annotoriousInstance?.current?.setDrawingEnabled(false);
      }
    }
  });

  // Apply annotations to Annotorious instance
  useEffect(() => {
    if (
      annotations.length === 0 ||
      (annotoriousInstance?.current && annotations?.length > 0)
    ) {
      // console.log("The annotations in effect", annotations);
      annotoriousInstance?.current?.clearAnnotations();
      annotoriousInstance?.current?.setAnnotations(annotations);
    }
  }, [annotations]);

  // Preprocess the shapeList to ensure all coordinates are numbers
  useEffect(() => {
    const aiShapes = preprocessShapeList(shapeList);
    setProcessedShapeList(() => aiShapes);
  }, [shapeList]);

  // Preprocess the shapeList to ensure all coordinates are numbers
  useEffect(() => {
    const manualShapes = processedManualShapesList(manualCoordinates);
    setProcessedManualShapeList(() => manualShapes);
  }, [manualCoordinates]);

  const updateOverlays = () => {
    const annotations = [];
    const viewer = openSeadragon.instance;

    // Validate processedShapeList before proceeding
    if (!processedShapeList || processedShapeList?.length === 0) {
      console.warn("Processed shape list is empty or invalid.");
      // return;
    }

    if (!processedManualShapeList || processedManualShapeList.length === 0) {
      console.warn("Processed manual shape list is empty or invalid.");
      // return;
    }

    try {
      const dimentions = getImageDimensions();
      // Add overlays for the shape list
      processedShapeList?.forEach((shape, index) => {
        const viewportCoordinates = shape.map((point) =>
          viewer.viewport.imageToViewportCoordinates(
            (point.x / 100) * dimentions.width,
            (point.y / 100) * dimentions.height
          )
        );

        const xMin = Math.min(...viewportCoordinates.map((coord) => coord.x));
        const yMin = Math.min(...viewportCoordinates.map((coord) => coord.y));
        const xMax = Math.max(...viewportCoordinates.map((coord) => coord.x));
        const yMax = Math.max(...viewportCoordinates.map((coord) => coord.y));

        const overlayRect = new OpenSeadragon.Rect(
          xMin,
          yMin,
          xMax - xMin,
          yMax - yMin
        );
        const imageCoordinate =
          viewer.viewport.viewportToImageRectangle(overlayRect);
        annotations.push(getAnnotationModel(imageCoordinate));
      });

      if (processedManualShapeList && processedManualShapeList.length > 0) {
        processedManualShapeList?.forEach((shape) => {
          if (shape) {
            shape?.forEach((manualCoordinate, index) => {
              const overlayRect = new OpenSeadragon.Rect(
                manualCoordinate.x,
                manualCoordinate.y,
                manualCoordinate.width / viewer.viewport.getContainerSize().x,
                manualCoordinate.height / viewer.viewport.getContainerSize().y
              );
              const imageCoordinate =
                viewer.viewport.viewportToImageRectangle(overlayRect);
              annotations.push(getAnnotationModel(imageCoordinate));
            });
          }
        });
      }

      annotationCoordinates?.forEach((shape) => {
        annotations.push(shape);
      });
    } catch (error) {
      console.error("Error while updating overlays:", error);
    }
    setAnnotations(annotations);
  };

  const getImageDimensions = () => {
    const viewer = openSeadragon.instance;
    if (!viewer) return null;

    const tiledImage = viewer.world.getItemAt(0); // Get the first image (if multiple images are loaded)
    if (!tiledImage) {
      console.error("No tiled image found in the viewer.");
      return null;
    }

    const contentSize = tiledImage.getContentSize(); // Get the image's width and height
    const { x: width, y: height } = contentSize;

    return { width, height };
  };

  useEffect(() => {
    updateOverlays();
  }, [processedShapeList, openSeadragon]);

  return null; // The overlays are managed directly via OpenSeadragon
};

Overlay.propTypes = {
  shapeList: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      }).isRequired
    ).isRequired
  ).isRequired,
  openSeadragon: PropTypes.object.isRequired,
  annotoriousInstance: PropTypes.object.isRequired,
};

export default Overlay;
