import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "antd";
import { connect } from "react-redux";

import logo from "@/assets/logo.png";
import avatar from "@/assets/avatar.png";
import { LogoutIcon } from "@/assets/svg";
import { Button } from "@/components/common";
import { getUserData } from "@/utils/storage";
import sideMenuItems from "@/constants/sideMenuItems";
import { logoutUser } from "@/actions/userActions";
import { USER_MANAGEMENT_PATHS } from "@/constants";

import "./styles.scss";

const Sidemenu = ({ logoutUser, collapsed, handleToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUserData();

  const handleNavigate = (e) => {
    navigate(`/${e.key}`);
  };

  const fetchDefaultOpenKeys = (path) => {
    const currentPath = path?.pathname?.slice(1);

    if (USER_MANAGEMENT_PATHS.includes(currentPath)) {
      return ["user-management"];
    }

    return [""];
  };

  const handleActivePath = (path) => {
    const activePath = path?.pathname?.split("/")[1];

    if (activePath === "users") {
      return [`users/${path?.pathname?.split("/")[2]}`];
    }

    return [path?.pathname?.split("/")[1]];
  };

  return (
    <aside
      className={`sidemenu-main-container ${collapsed && "sidemenu-collapsed"}`}
    >
      <span className="collapse-button" onClick={handleToggleCollapse} />

      <section className="sidemenu-layout-container">
        <section className="sidemenu-innermenu-wrapper">
          <img src={logo} alt="Diagnostic Icon" className="sidemenu-icon" />

          <Menu
            className="custom-sidemenu-container"
            onClick={handleNavigate}
            defaultSelectedKeys={handleActivePath(location)}
            defaultOpenKeys={fetchDefaultOpenKeys(location)}
            mode="inline"
            items={sideMenuItems(user?.role)}
            inlineCollapsed={collapsed}
          />
        </section>

        <section className="sidemenu-profile-container">
          <article className="profile-detail-container">
            <img className="profile-icon" src={avatar} alt="user-icon" />
            <p className="profile-name">{user?.fullName}</p>
            <p className="profile-role">{user?.role}</p>
          </article>

          <Button
            classes="sidemenu-signout-button"
            title="Logout"
            icon={<LogoutIcon />}
            handleClick={() => logoutUser(navigate)}
          />
        </section>
      </section>
    </aside>
  );
};

export default connect(null, { logoutUser })(Sidemenu);
