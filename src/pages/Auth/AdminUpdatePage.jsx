import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateAdmin } from "../../redux/authSlice";
import { Button, InputField } from "../../components";
import Logo from "../../assets/logo.png";

const AdminUpdatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, status, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: data?.username || "",
    password: "",
    email: data?.email || "",
    mobile: data?.mobile || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const response = dispatch(updateAdmin(formData));
  };

  const handleSkip = () => {
    if (data) {
      switch (data.role) {
        case "admin":
          navigate("/admin-home");
          break;
        case "kap_employee":
          navigate("/kap-employee-home");
          break;
        case "government_employee":
          navigate("/government-employee-home");
          break;
        case "company_employee":
          navigate("/company-employee-home");
          break;
        case "integration_employee":
          navigate("/integration-employee-home");
          break;
        default:
          navigate("/login");
      }
    }
  };

  return (
    <div className="flex items-center align-middle h-full justify-center mt-5 ">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Company Logo" className="h-20 w-20" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Update Information
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Username:"
            name="username"
            placeholder="Enter new user name"
            value={formData.username}
            onChange={handleChange}
            className="mb-4"
          />

          {data?.role == "admin" && (
            <InputField
              label="Email:"
              name="email"
              placeholder="Enter new user name"
              value={formData.email}
              onChange={handleChange}
              className="mb-4"
            />
          )}
          {data?.role == "admin" && (
            <InputField
              label="Mibile Number:"
              name="mobil"
              placeholder="Enter new user name"
              value={formData.mobile}
              onChange={handleChange}
              className="mb-4"
            />
          )}
          <InputField
            label="Old Password:"
            name="oldPassword"
            type="password"
            placeholder="Enter New Password"
            value={formData.password}
            onChange={handleChange}
            className="mb-4"
          />
          <InputField
            label="NewPassword:"
            name="newPassword"
            type="password"
            placeholder="Enter New Password"
            value={formData.password}
            onChange={handleChange}
            className="mb-4"
          />

          <div className="flex justify-between">
            <Button
              text="Skip"
              onClick={handleSkip}
              className="w-1/2 bg-gray-500 hover:bg-gray-700 mr-2"
            />
            <Button
              text={status === "loading" ? "Saving..." : "Save"}
              type="submit"
              className="w-1/2 bg-green-600 hover:bg-green-700"
              disabled={status === "loading"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdatePage;
