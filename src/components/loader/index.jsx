import "./styles.scss";

const Loader = ({ heading }) => (
  <div className="lds-roller">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>

    {heading && <p className="heading">{heading}</p>}
  </div>
);
export default Loader;
