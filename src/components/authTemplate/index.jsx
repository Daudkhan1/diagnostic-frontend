import { useState } from "react";

import {
  LanguagesIcon,
  LanguagesDropdownIcon,
  NavigateButtonIcon,
} from "@/assets/svg";
import logo from "@/assets/logo.png";
import { Select, Button } from "@/components/common";

import { languages } from "@/constants/languages";

import "./styles.scss";

const AuthTemplate = (props) => {
  const {
    displayLogo = true,
    heading,
    caption,
    showNavigate,
    handleGoBack,
    children,
  } = props;

  const [language, setLanguage] = useState({
    value: "EN",
    label: "EN",
  });

  const handleLanguageChange = (value) => {
    setLanguage(() => value);
  };

  return (
    <section className="auth-main-container">
      <section className="auth-content-container">
        <h3 className="auth-content-heading">
          Revolutionizing Healthcare with
          <span className="bolder-heading"> AI Diagnostics</span>
        </h3>
      </section>

      <section className="auth-form-container">
        <section className="auth-form-wrapper">
          <section className="login-form-container">
            <section className="form-body-container">
              {showNavigate && (
                <Button
                  buttonType="iconOnly"
                  classes="navigate-button"
                  icon={<NavigateButtonIcon />}
                  handleClick={handleGoBack}
                />
              )}

              <Select
                classes="language-select-field"
                selectType="language"
                suffixIcon={<LanguagesDropdownIcon />}
                prefixIcon={<LanguagesIcon />}
                options={languages}
                value={language}
                onChange={handleLanguageChange}
                disabled={true}
              />

              {displayLogo && (
                <img src={logo} alt="Diagnostic Icon" className="form-icon" />
              )}
              {heading && <h4 className="form-heading">{heading}</h4>}

              {caption && <p className="form-caption">{caption}</p>}

              {children}
            </section>
          </section>
        </section>
      </section>
    </section>
  );
};

export default AuthTemplate;
