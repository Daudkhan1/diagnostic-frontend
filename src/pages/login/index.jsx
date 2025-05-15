import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { connect } from "react-redux";

import AuthTemplate from "@/components/authTemplate";
import { Input, Button } from "@/components/common";
import { loginUser } from "@/actions/userActions";

import "./styles.scss";

const Login = ({ loginUser }) => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      username: input.email,
      password: input.password,
    };

    loginUser(payload, navigate, setError, setLoading);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <AuthTemplate heading="Login">
      <section className="login-form-inner-container">
        <section className="login-form-fields-container">
          <Input
            label="Email Address"
            name="email"
            placeholder="Enter Email Address"
            value={input.email}
            onChange={handleInput}
          />

          <Input
            inputType="password"
            label="Password"
            name="password"
            placeholder="Enter Password"
            value={input.password}
            onChange={handleInput}
          />
        </section>

        <Button
          buttonType="textOnly"
          title="Forgot Password?"
          classes="login-form-forgot-button"
          handleClick={handleForgotPassword}
        />

        <section className="login-button-container">
          {error && <p className="error-message">{error}</p>}

          <Button
            title="Login"
            classes="login-button"
            handleClick={handleSubmit}
            disabled={!input.email || !input.password}
          />
        </section>

        <p className="signup-option-link">
          Don’t have an account?
          <Link to="/signup">
            <span className="sign-up-link"> Sign Up</span>
          </Link>
        </p>
      </section>
    </AuthTemplate>
  );
};

export default connect(null, { loginUser })(Login);
