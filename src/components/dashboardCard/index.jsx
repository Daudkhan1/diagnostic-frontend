import "./styles.scss";

const DashboardCard = (props) => {
  const { icon, metrics, title, classes } = props;

  return (
    <section className={`admin-card-container ${classes}`}>
      <span className="card-icon">{icon}</span>
      <p className="metrics">{metrics}</p>
      <p className="title">{title}</p>
    </section>
  );
};

export default DashboardCard;
