import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../redux/authSlice";
import { Button, InputField } from "../../components";
import logo from "../../assets/logo.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(""); // State for error messages

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before attempting login

    if (!formData.username.trim()) {
      setError("Username cannot be empty");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password cannot be empty");
      return;
    }

    try {
      // Dispatch login action
      const response = await dispatch(loginUser(formData));

      // Check if login failed
      if (response.payload && !response.payload.success) {
        console.log("Login failed response:", response.payload);
        setError(response.payload.message);

        // Debugging: Check if state updates
        setTimeout(() => console.log("Updated Error:", error), 0);
      } else {
        navigate("/admin-update");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 px-4 mt-5">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Company Logo" className="h-40 w-40" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Login to Your Account
        </h2>

        {/* Display error message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Username:"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            className="mb-4"
          />
          <InputField
            label="Password:"
            name="password"
            placeholder="Enter your password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mb-4"
          />

          <Button
            text="Login"
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition text-white font-bold py-2 rounded-md"
            disabled={success === false} // Disable if login failed
          />
        </form>

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
