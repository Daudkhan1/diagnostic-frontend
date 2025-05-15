import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthTemplate from "@/components/authTemplate";
import { Input, Button } from "@/components/common";

import "./styles.scss";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleEmail = (e) => {
    setEmail(() => e.target.value);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <AuthTemplate
      heading="Forgot Password"
      showNavigate
      handleGoBack={handleGoBack}
    >
      <section className="forgot-password-form-container">
        <Input
          label="Email Address"
          name="email"
          placeholder="Enter Email Address"
          value={email}
          onChange={handleEmail}
        />

        <Button
          title="Reset Password"
          classes="reset-password-button"
          disabled={!email}
          //   handleClick={handleSubmit}
        />
      </section>
    </AuthTemplate>
  );
};

export default ForgotPassword;
