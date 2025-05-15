import { useState } from "react";

import {
  LanguagesIcon,
  LanguagesDropdownIcon,
  ArrowLeftIcon,
} from "@/assets/svg";
import Sidemenu from "@/components/sidemenu";
import { Notification } from "@/components";
import { Select, Button } from "@/components/common";
import { languages } from "@/constants/languages";

import "./styles.scss";

const DashboardTemplate = (props) => {
  const { goBack, handleGoBack, heading, caption, lessGap, children } = props;

  const [collapsed, setCollapsed] = useState(
    sessionStorage.getItem("praid-sidemenu-collapsed") === "true"
  );
  const [language, setLanguage] = useState({
    value: "EN",
    label: "EN",
  });

  const handleLanguageChange = (value) => {
    setLanguage(() => value);
  };

  const handleToggleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    sessionStorage.setItem(
      "praid-sidemenu-collapsed",
      newCollapsedState.toString()
    );
  };

  return (
    <section
      className={`admin-template-main-container ${
        collapsed && "main-container-collapsed"
      }`}
    >
      <Sidemenu
        collapsed={collapsed}
        handleToggleCollapse={handleToggleCollapse}
      />

      <section className="admin-template-dashboard-container">
        {/* <Select
          selectType="language"
          classes="language-select-field"
          suffixIcon={<LanguagesDropdownIcon />}
          prefixIcon={<LanguagesIcon />}
          options={languages}
          value={language}
          onChange={handleLanguageChange}
          disabled={true}
        />

        <Notification /> */}

        {heading && (
          <article className="main-header-heading">
            <p className="heading">{heading}</p>

            {caption && <p className="caption">{caption}</p>}
          </article>
        )}

        {goBack && (
          <article className={`navigation-header ${lessGap && "less-gap"}`}>
            <Button
              buttonType="iconOnly"
              classes="navigate-dashboard-button"
              icon={<ArrowLeftIcon />}
              handleClick={handleGoBack}
            />
          </article>
        )}

        {children}
      </section>
    </section>
  );
};

export default DashboardTemplate;
