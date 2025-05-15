import { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import PropTypes from "prop-types";
import "@annotorious/openseadragon/annotorious-openseadragon.css";

import Overlay from "./overlay";

import "./styles.scss";

const Annotator = forwardRef((props, ref) => {
  const {
    openSeadragon,
    annotationEnabled,
    coordinates,
    manualCoordinates,
    annotoriousInstance,
    setCurrentAnnotation,
    annotationCoordinates,
    currentAnnotation,
    activeTool,
  } = props;
  const [shapeList, setShapeList] = useState([]);
  const [isDrawingMode] = useState(annotationEnabled);
  const [drawing, setDrawing] = useState(false);
  const viewerRef = openSeadragon?.instance;

  annotoriousInstance.current.setUserSelectAction("NONE");
  annotoriousInstance.current.setStyle({
    fill: "transparent",
    fillOpacity: 0,
    stroke: "#ff0000",
    strokeWidth: 2,
    strokeOpacity: 0.7,
  });

  const disableZoomAndPan = () => {
    if (viewerRef) {
      viewerRef.zoomPerClick = 1; // Prevent zooming by click
      viewerRef.zoomPerScroll = 1; // Prevent zooming by scroll
      viewerRef.gestureSettingsMouse.dragToPan = false; // Disable panning
      viewerRef.gestureSettingsTouch.dragToPan = false;
    }
  };

  const enableZoomAndPan = () => {
    if (viewerRef) {
      viewerRef.zoomPerClick = 2; // Restore default zoom behavior for click
      viewerRef.zoomPerScroll = 1.2; // Restore default zoom behavior for scroll
      viewerRef.gestureSettingsMouse.dragToPan = true; // Enable panning
      viewerRef.gestureSettingsTouch.dragToPan = true;
    }
  };

  useImperativeHandle(ref, () => ({
    clearCurrentAnnotation: () => {
      console.log("drawing" + drawing);
      if (drawing) {
        console.log("Clear current annotation");

        setDrawing(false);
      }
    },
  }));

  useEffect(() => {
    if (annotationEnabled) {
      disableZoomAndPan(); // Disable zoom and pan when annotation mode is enabled
      annotoriousInstance?.current?.setDrawingTool(activeTool);
      annotoriousInstance?.current?.setDrawingEnabled(true);
    } else {
      enableZoomAndPan(); // Enable zoom and pan when annotation mode is disabled
      annotoriousInstance?.current?.setDrawingEnabled(false);
      const annotations = annotoriousInstance?.current?.getAnnotations();
      if (annotations?.length > 0) {
        const lastAnnotation = annotations[annotations.length - 1];
        if (lastAnnotation) {
          annotoriousInstance?.current?.removeAnnotation(lastAnnotation.id);
          setCurrentAnnotation(null);
        }
      } else {
        setCurrentAnnotation(null);
      }
    }

    return () => {
      enableZoomAndPan();
    };
  }, [annotationEnabled, activeTool]);

  useEffect(() => {
    if (coordinates) {
      const updatedShapeList = coordinates.map((coord) => coord);
      setShapeList(updatedShapeList);
    }
  }, [coordinates]);

  return (
    <div
      id="annotator"
      className={`annotator ${!isDrawingMode && "broadCastEvents"}`}
    >
      {openSeadragon?.instance && annotoriousInstance && (
        <Overlay
          shapeList={shapeList}
          annotoriousInstance={annotoriousInstance}
          manualCoordinates={manualCoordinates}
          annotationCoordinates={annotationCoordinates}
          openSeadragon={openSeadragon}
          setCurrentAnnotation={setCurrentAnnotation}
        />
      )}
    </div>
  );
});

Annotator.propTypes = {
  openSeadragon: PropTypes.object.isRequired,
  annotoriousInstance: PropTypes.object.isRequired,
  annotationEnabled: PropTypes.bool.isRequired,
  coordinates: PropTypes.array,
  manualCoordinates: PropTypes.array,
};

export default Annotator;
