import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../redux/authSlice";
import { Button, InputField } from "../../components";
import logo from "../../assets/logo.png";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, success, message } = useSelector((state) => state.auth);
  const [Error, setError] = useState(message);

  // Effect to navigate based on login success and role

  // Effect to handle error message updates
  useEffect(() => {
    if (!success) {
      setError(message);
    }
  }, [message, success]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username.length < 1) {
      setError("Username cannot be empty");
      return;
    }
    if (formData.password.length < 1) {
      setError("Password cannot be empty");
      return;
    }

    if (!data) {
      const response = dispatch(loginUser(formData));
      console.log(response);
      navigate("/admin-update");
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

        {/* Show error if not successful */}
        {!success && <p className="text-red-500 text-center mb-4">{Error}</p>}

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
