import { RegisterSuccessIcon } from "@/assets/svg";

import { Button } from "@/components/common";

const Success = (props) => {
  const { handleGoToLogin } = props;

  return (
    <section className="registration-success-container">
      <RegisterSuccessIcon />

      <p className="success-heading">Signup Successful!</p>

      <p className="success-caption">
        Your account request has been submitted successfully. Our admin team
        will review your request. Thank you for your patience.
      </p>

      <Button
        title="Go to Login"
        classes="go-to-login-button"
        handleClick={handleGoToLogin}
      />
    </section>
  );
};

export default Success;
