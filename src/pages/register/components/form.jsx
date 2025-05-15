import avatar from "@/assets/avatar.png";
import { UserAvatarIcon } from "@/assets/svg";

import { Input } from "@/components/common";

const Form = (props) => {
  const { formData, handleInputChange } = props;

  return (
    <section className="login-form-fields-container">
      <section className="user-avatar">
        <span className="avatar-wrapper">
          <img src={avatar} className="avatar" alt="avatar" />
          <UserAvatarIcon />
        </span>

        <p className="avatar-title">Profile Image</p>
      </section>

      <Input
        label="Full Name"
        name="fullName"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={handleInputChange}
      />

      <Input
        label="Email Address"
        name="email"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={handleInputChange}
      />

      {/* <Input
        label="Role"
        name="role"
        placeholder="Enter your role"
        value={formData.role}
        onChange={handleInputChange}
      /> */}

      <Input
        label="Contact Number"
        name="phoneNumber"
        placeholder="Enter your Contact Number"
        value={formData.phoneNumber}
        onChange={handleInputChange}
      />

      <Input
        inputType="password"
        label="Password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleInputChange}
      />

      <Input
        inputType="password"
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Enter your password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
      />
    </section>
  );
};

export default Form;
