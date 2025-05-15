import { useEffect, useState } from "react";
import OpenSeadragon from "openseadragon";
import { createOSDAnnotator } from "@annotorious/openseadragon";
import { mountPlugin as ToolsPlugin } from "@annotorious/plugin-tools";
import { mountPlugin as FreeToolPlugin } from "./freedraw";
import { useSelector, useDispatch } from "react-redux";

import { setFullScreen } from "@/reducers/fullScreen";
import {
  FullScreenIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ToolsMenuDeleteIcon,
} from "@/assets/svg";
import { CANTALOUPE_SERVER } from "@/constants";
import { Collapse, Button } from "@/components/common";

import "./styles.scss";

const OpenSeaDragonViewer = ({
  tileSources,
  showNavigationControl,
  showNavigator,
  navigatorPosition,
  onOpen,
  viewerRef,
  annotoriousInstance,
  defaultZoom = 1,
  showScale = true,
  minZoomLevel = 1,
  selectedAnnotation,
  annotationEnabled,
  setAnnotationEnabled,
  hasAnnotation,
  showForm,
  hideAnnotationForm,
  handleCreateAnnotation,
  isValid,
  isEdit,
  sideBarTab
}) => {
  const dispatch = useDispatch();
  const { fullScreen } = useSelector((state) => state.fullScreen);

  const [zoomLevel, setZoomLevel] = useState(defaultZoom);
  const [scaleUnit, setScaleUnit] = useState("mm");
  const [showCollapse, setShowCollapse] = useState(true);

  const id = String(Math.round(Math.random() * 1000000000));
  const realDistanceInMeters = 0.01;

  useEffect(() => {
    const viewer = OpenSeadragon({
      id: id,
      prefixUrl: CANTALOUPE_SERVER,
      tileSources: tileSources,
      showNavigationControl,
      navigatorPosition,
      minZoomLevel: minZoomLevel,
      constrainDuringPan: true,
      maxZoomLevel: 200, // Allow zooming in more
      defaultZoomLevel: defaultZoom, // Set initial zoom level
      crossOriginPolicy: "Anonymous",
      showNavigator,
      visibilityRatio: 1,
    });

    if (onOpen) {
      annotoriousInstance.current = createOSDAnnotator(viewer);
      ToolsPlugin(annotoriousInstance.current);
      FreeToolPlugin(annotoriousInstance.current);

      viewer?.addHandler("open", () => {
        onOpen({ namespace: OpenSeadragon, instance: viewer });
      });
    }

    viewer?.addHandler("open", () => {
      const currentZoom = viewerRef.current.viewport.getZoom(true);
      viewerRef.current.viewport.zoomTo(currentZoom * 2.5); // Slightly zoom in (10% more)
    });

    viewer?.addHandler("zoom", () => {
      const zooming = viewer?.viewport?.getZoom();
      setZoomLevel(() => zooming);

      // Calculate the scale in millimeters based on zoom
      const scaleInMeters = realDistanceInMeters / zooming;
      const scaleInMm = scaleInMeters * 1000; // Convert to millimeters

      // Switch to micrometers only if scale is below 1mm
      const newScaleUnit = scaleInMm < 1 ? "µm" : "mm";
      setScaleUnit(newScaleUnit);
    });

    viewerRef.current = viewer;

    const zoomInButton = document.getElementById("zoomInButton");
    const zoomOutButton = document.getElementById("zoomOutButton");

    const zoomInHandler = () => {
      viewer.viewport.zoomBy(1.2);
      viewer.viewport.applyConstraints();
    };

    const zoomOutHandler = () => {
      viewer.viewport.zoomBy(0.8);
      viewer.viewport.applyConstraints();
    };

    zoomInButton?.addEventListener("click", zoomInHandler);
    zoomOutButton?.addEventListener("click", zoomOutHandler);

    return () => {
      zoomInButton?.removeEventListener("click", zoomInHandler);
      zoomOutButton?.removeEventListener("click", zoomOutHandler);
      viewerRef.current.world.removeAll();
      viewerRef.current.destroy();
    };
  }, [tileSources]);

  useEffect(() => {
    if (selectedAnnotation) {
      setShowCollapse(true);
    }
  }, [selectedAnnotation]);

  const calculateScaleLabel = () => {
    const scaleInMeters = realDistanceInMeters / zoomLevel;
    const scaleInMm = scaleInMeters * 1000; // Convert to millimeters
    const scaleInMicrometers = scaleInMm * 1000; // Convert to micrometers

    return scaleUnit === "mm"
      ? Math.round(scaleInMm)
      : Math.round(scaleInMicrometers);
  };

  const handleFullScreen = () => {
    dispatch(setFullScreen(!fullScreen));
  };

  const handleEraseAnnotation = () => {
    setAnnotationEnabled(false);
  };

  return (
    <>
      <div className="openseadragon-widget-container" id={id} />

      {showScale && zoomLevel !== null && (
        <div className="osd-zoom-indicator">
          <div className="indicator-bar" />
          <div className="indicator-text">
            {calculateScaleLabel()} {scaleUnit}
          </div>
        </div>
      )}

      <div className="openseadragon-tools-menu">
        <span id="zoomInButton" className="zoom-in-option">
          <ZoomInIcon />
        </span>

        <span id="zoomOutButton" className="zoom-out-option">
          <ZoomOutIcon />
        </span>

        {annotationEnabled && hasAnnotation && (
          <span className="delete-icon" onClick={handleEraseAnnotation}>
            <ToolsMenuDeleteIcon />
          </span>
        )}

        <span
          className={`full-screen-option ${fullScreen && "active"}`}
          onClick={handleFullScreen}
        >
          <FullScreenIcon />
        </span>
      </div>

      {selectedAnnotation && !annotationEnabled && !isEdit && (
        <div className="annotation-container">
          <Collapse
            annotationDetail={selectedAnnotation}
            onCollapseClose={() => setShowCollapse((prev) => !prev)}

            showCollapse={showCollapse}
            sideBarTab={sideBarTab}
          />
        </div>
      )}

      {showForm && (
        <article className={`form-footer-buttons ${fullScreen ? "full-screen" : ""}`}>
          <Button
            title="Cancel Editing"
            classes="simple add-button-with-icon"
            handleClick={hideAnnotationForm}
          />

          <Button
            title="Save"
            classes="add-button-with-icon"
            disabled={!isValid}
            handleClick={handleCreateAnnotation}
          />
        </article>
      )}
    </>
  );
};
export default OpenSeaDragonViewer;
