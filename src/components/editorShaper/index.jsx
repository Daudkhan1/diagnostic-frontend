import {
  ShaperSquareIcon,
  ShaperEclipseIcon,
  ShaperPolygonIcon,
  PencilToolIcon,
} from "@/assets/svg";

import "./styles.scss";

const EditorShaper = (props) => {
  const { currentAnnotation, annotationEnabled, activeTool, toggleAnnotator } =
    props;

  return (
    <section className="annotations-shape-container">
      <p className="shaper-heading">Annotation Tools</p>

      <section
        className={`shaper-container ${currentAnnotation ? "disabled" : ""}`}
        style={{ pointerEvents: currentAnnotation ? "none" : "auto" }}
      >
        <article
          className="shaper"
          onClick={() => toggleAnnotator("rectangle")}
        >
          <span
            className={`icon ${
              annotationEnabled && activeTool === "rectangle" && "active"
            }`}
          >
            <ShaperSquareIcon />
          </span>

          <p className="name">Square</p>
        </article>

        <article className="shaper" onClick={() => toggleAnnotator("ellipse")}>
          <span
            className={`icon ${
              annotationEnabled && activeTool === "ellipse" && "active"
            }`}
          >
            <ShaperEclipseIcon />
          </span>

          <p className="name">Ellipse</p>
        </article>

        <article className="shaper" onClick={() => toggleAnnotator("polygon")}>
          <span
            className={`icon ${
              annotationEnabled && activeTool === "polygon" && "active"
            }`}
          >
            <ShaperPolygonIcon />
          </span>

          <p className="name">Polygon</p>
        </article>

        <article className="shaper" onClick={() => toggleAnnotator("freehand")}>
          <span
              className={`icon ${
                  annotationEnabled && activeTool === "freehand" && "active"
              }`}
          >
            <PencilToolIcon />
          </span>

          <p className="name">Pencil</p>
        </article>
      </section>
    </section>
  );
};

export default EditorShaper;
