import { Drawer, Button, Switch } from "@/components/common";
import { getUserNameInitials } from "@/utils/helpers";

import "./styles.scss";

const UserDetailField = (props) => {
  const { label, value, status } = props;

  const tagType = (name) => {
    if (name === "ACTIVE") {
      return "active";
    } else if (name === "INACTIVE") {
      return "inactive";
    } else {
      return "";
    }
  };

  return (
    <article className="user-detail-content">
      <p className="label">{label}</p>

      <p className="user-data">{value}</p>

      {status && <p className={`status ${tagType(status)}`}>{status}</p>}
    </article>
  );
};

const UserDetailsDrawer = (props) => {
  const {
    currentUser,
    handleHideUserDetails,
    showUserDetails,
    role,
    handleChangeUserStatus,
  } = props;

  return (
    <Drawer
      title="User Details"
      onClose={handleHideUserDetails}
      open={showUserDetails}
    >
      <section className="user-details-drawer-content-wrapper">
        <section className="user-details-container">
          <article className="name-and-avatar-container">
            <span className="initials-avatar">
              {getUserNameInitials(currentUser.name)}
            </span>

            <p className="name">{currentUser.name}</p>
          </article>

          <UserDetailField label="Email Address" value={currentUser.email} />

          <UserDetailField
            label="Contact Number"
            value={currentUser.contactNumber}
          />

          <section className="multi-user-detail">
            <UserDetailField label="User Type" value={currentUser.userType} />

            <UserDetailField label="Status" status={currentUser.status} />
          </section>
        </section>

        <section className="user-details-container">
          <p className="actions">Actions</p>

          {(currentUser.status === "ACTIVE" ||
            currentUser.status === "INACTIVE") && (
            <section className="toggler-action">
              <p className="toggle-action">{currentUser.status}</p>

              <Switch
                checked={currentUser.status === "ACTIVE"}
                onChange={() =>
                  handleChangeUserStatus(
                    currentUser.uniqueId,
                    currentUser.status
                  )
                }
              />
            </section>
          )}

          {currentUser.status === "NEW" &&
            (role === "PATHOLOGIST_TECHNICIAN" ||
              role === "PATHOLOGIST" ||
              role === "RADIOLOGIST_TECHNICIAN" ||
              role === "RADIOLOGIST") && (
              <article className="actions-button-container">
                <Button
                  title="Accept"
                  classes="user-action-button accept-button"
                  handleClick={() =>
                    handleChangeUserStatus(currentUser.uniqueId, "INACTIVE")
                  }
                />

                <Button
                  title="Reject"
                  classes="user-action-button reject-button"
                  handleClick={() =>
                    handleChangeUserStatus(currentUser.uniqueId, "ACTIVE")
                  }
                />
              </article>
            )}
        </section>
      </section>
    </Drawer>
  );
};

export default UserDetailsDrawer;
