import React, { useState } from "react";
import { Button, InputField } from "../../components";
import logo from "../../assets/logo.png"; // Make sure Logo is correctly imported

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo */}

        <div className="flex justify-center mb-6">
          <img src={logo} alt="Company Logo" className="h-40 w-40" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Login to Your Account
        </h2>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label={"Username:"}
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            className="mb-4"
          />
          <InputField
            label={"Password:"}
            name="password"
            placeholder="Enter your password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mb-4"
          />

          {/* Login Button */}
          <Button
            text="Login"
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition text-white font-bold py-2 rounded-md"
          />
        </form>

        {/* Extra Links */}
        <div className="text-center mt-4">
          <a
            href="/forgot-password"
            className="text-blue-500 hover:underline text-sm"
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
