import { useState } from "react";
import { Switch, Case, Default } from "react-if";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";

import pathologist from "@/assets/pathologist.png";
import radiologist from "@/assets/radiologist.png";
import radiologyTechnician from "@/assets/pathology-technician.png";
import pathologyTechnician from "@/assets/radiology-technician.png";

import AuthTemplate from "@/components/authTemplate";
import { Button } from "@/components/common";
import { Card, Form, Success } from "./components";
import { registerUser } from "@/actions/userActions";

import "./styles.scss";

const Register = ({ registerUser }) => {
  const navigate = useNavigate();

  const [slide, setSlide] = useState(1);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    phoneNumber: "",
    confirmPassword: "",
  });

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);

    setFormData((prevData) => ({
      ...prevData,
      role: selectedCategory,
    }));
  };

  const handleGoBack = () => {
    if (slide === 1) {
      navigate("/");
    } else {
      setSlide((st) => st - 1);
    }
  };

  const handleContinue = () => {
    setSlide((st) => st + 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignup = async () => {
    if (formData.password === formData.confirmPassword) {
      registerUser(formData, navigate, setError, setLoading, handleContinue);
    }
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  return (
    <Switch>
      <Case condition={slide === 1}>
        <AuthTemplate
          heading="Sign Up"
          caption="Join Us Today! Choose your role to get started"
          showNavigate
          handleGoBack={handleGoBack}
        >
          <section className="role-card-container">
            <Card
              active={category === "PATHOLOGIST"}
              role="Pathologist"
              image={pathologist}
              onClick={() => handleCategorySelect("PATHOLOGIST")}
            />

            <Card
              active={category === "RADIOLOGIST"}
              role="Radiologist"
              image={radiologist}
              onClick={() => handleCategorySelect("RADIOLOGIST")}
            />

            <Card
              active={category === "PATHOLOGIST_TECHNICIAN"}
              role="Pathologist Technician"
              image={pathologyTechnician}
              onClick={() => handleCategorySelect("PATHOLOGIST_TECHNICIAN")}
            />

            <Card
              active={category === "RADIOLOGIST_TECHNICIAN"}
              role="Radiology Technician"
              image={radiologyTechnician}
              onClick={() => handleCategorySelect("RADIOLOGIST_TECHNICIAN")}
            />
          </section>

          <Button
            title="Continue"
            classes="selected-role-button"
            handleClick={handleContinue}
            disabled={!category}
          />
        </AuthTemplate>
      </Case>

      <Case condition={slide === 2}>
        <AuthTemplate
          heading="Sign Up"
          displayLogo={false}
          showNavigate
          handleGoBack={handleGoBack}
        >
          <Form formData={formData} handleInputChange={handleInputChange} />

          <section className="signup-button-container">
            {error && <p className="error-message">{error}</p>}

            <Button
              title="Sign Up"
              classes="signup-button"
              disabled={formData.password !== formData.confirmPassword}
              handleClick={handleSignup}
            />
          </section>
        </AuthTemplate>
      </Case>

      <Default>
        <AuthTemplate
          displayLogo={false}
          showNavigate
          handleGoBack={handleGoBack}
        >
          <Success handleGoToLogin={handleGoToLogin} />
        </AuthTemplate>
      </Default>
    </Switch>
  );
};

export default connect(null, { registerUser })(Register);
