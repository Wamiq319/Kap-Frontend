import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, InputField } from "../../components";
import Logo from "../../assets/logo.png"; // Ensure the correct path

const AdminUpdatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    mobile: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Admin Info:", formData);
    navigate("/admin-home");
  };

  const handleSkip = () => {
    navigate("/admin-home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Company Logo" className="h-20 w-20" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Update Information
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <InputField
            label={"Username:"}
            name="username"
            placeholder="Enter new user name"
            value={formData.username}
            onChange={handleChange}
            className="mb-4"
          />
          <InputField
            label={"Password:"}
            name="password"
            type="password"
            placeholder="Enter New Password"
            value={formData.password}
            onChange={handleChange}
            className="mb-4"
          />
          <InputField
            label={"Email:"}
            name="email"
            type="email"
            placeholder="Enter new email ID"
            value={formData.email}
            onChange={handleChange}
            className="mb-4"
          />
          <InputField
            label={"Mobile:"}
            name="mobile"
            type="tel"
            placeholder="Enter new phone number"
            value={formData.mobile}
            onChange={handleChange}
            className="mb-4"
          />

          {/* Buttons */}
          <div className="flex justify-between">
            <Button
              text="Skip"
              onClick={handleSkip}
              className="w-1/2 bg-gray-500 hover:bg-gray-700 mr-2"
            />
            <Button
              text="Save"
              type="submit"
              className="w-1/2 bg-green-600 hover:bg-green-700"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdatePage;
