import { CheckFilledIcon, CheckEmptyIcon } from "@/assets/svg";

const Card = (props) => {
  const { active, image, role, onClick } = props;

  return (
    <section className={`role-card ${active && "active"}`} onClick={onClick}>
      <span className="role-check-icon">
        {active ? <CheckFilledIcon /> : <CheckEmptyIcon />}
      </span>

      <img src={image} alt={role} className="role-card-icon" />

      <p className="role-card-title">{role}</p>
    </section>
  );
};

export default Card;
