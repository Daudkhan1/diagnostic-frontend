import OpenSeadragon from "openseadragon";

export const smoothZoomTo = (
  viewer,
  targetBounds,
  duration = 2000,
  zoomFactor = 0.998
) => {
  const startBounds = viewer.viewport.getBounds(true);
  const startTime = performance.now();

  function animateZoom(currentTime) {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1); // Normalized time (0 to 1)

    // Adjust the difference by zoomFactor to reduce the zoom effect
    const interpolatedBounds = new OpenSeadragon.Rect(
      startBounds.x + (targetBounds.x - startBounds.x) * t * zoomFactor,
      startBounds.y + (targetBounds.y - startBounds.y) * t * zoomFactor,
      startBounds.width +
        (targetBounds.width - startBounds.width) * t * zoomFactor,
      startBounds.height +
        (targetBounds.height - startBounds.height) * t * zoomFactor
    );

    viewer.viewport.fitBounds(interpolatedBounds, true);

    if (t < 1) {
      requestAnimationFrame(animateZoom); // Continue until we reach the end
    }
  }

  requestAnimationFrame(animateZoom);
};

export const smoothZoomToManual = (
  viewer,
  targetRect,
  duration = 2000,
  zoomFactor = 0.5
) => {
  if (!viewer) {
    console.error("Viewer is not initialized.");
    return;
  }

  const startBounds = viewer.viewport.getBounds(true); // Get the current bounds
  const startTime = performance.now(); // Record the start time

  function animateZoom(currentTime) {
    const elapsed = currentTime - startTime; // Time elapsed since start
    const t = Math.min(elapsed / duration, 1); // Normalized time (0 to 1)

    // Apply easing function for smooth transition
    const easedT = t * (2 - t); // Ease-out (you can change this to other easing functions)

    // Adjust the difference by zoomFactor to reduce the zoom effect
    const interpolatedBounds = new OpenSeadragon.Rect(
      startBounds.x + (targetRect.x - startBounds.x) * easedT * zoomFactor,
      startBounds.y + (targetRect.y - startBounds.y) * easedT * zoomFactor,
      startBounds.width +
        (targetRect.width - startBounds.width) * easedT * zoomFactor,
      startBounds.height +
        (targetRect.height - startBounds.height) * easedT * zoomFactor
    );

    viewer.viewport.fitBounds(interpolatedBounds, true); // Apply interpolated bounds

    if (t < 1) {
      requestAnimationFrame(animateZoom); // Continue animation until `t` reaches 1
    }
  }

  requestAnimationFrame(animateZoom); // Start the animation loop
};

export const getManualAnnotations = (value) =>
  value?.filter((annotation) => annotation.annotation_type === "MANUAL");

export const getAIAnnotations = (value) =>
  value?.filter((annotation) => annotation.annotation_type === "AI");

export const displayLatestStatus = (latestCaseStatus, user, state) => {
  if (!latestCaseStatus) return state?.status;

  const isIncoming =
    user.id === latestCaseStatus?.transferredToPathologistId &&
    latestCaseStatus?.newStatus === "REFERRED";

  const isReferred =
    user.id === latestCaseStatus?.actionByPathologistId &&
    latestCaseStatus?.newStatus === "REFERRED";

  return isIncoming ? "INCOMING" : isReferred ? "TRANSFERRED" : state?.status;
};

export const gradingList = [
  {id: "", name: "NEW_GRADING", organ: "ENTER NEW GRADING" },
];

export const spectrumList = [
  { id: "", name: "NEW_SPECTRUN", organ: "ENTER NEW SPECTRUM" }
];

export const subTypeList = [
  { id: "", name: "NEW_SUB_TYPE", organ: "ENTER NEW TYPE" },
];

