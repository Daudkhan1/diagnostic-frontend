import { NotificationBellIcon } from "@/assets/svg";

import "./styles.scss";

const Notification = () => {
  return (
    <section className="floating-notification-container">
      <section className="floating-container-inner">
        <NotificationBellIcon />

        {/* <p className="notification-badge">15</p> */}
      </section>
    </section>
  );
};

export default Notification;
