import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateAdmin, updatePassword } from "../../redux/authSlice";
import { Button, InputField } from "../../components";
import Logo from "../../assets/logo.png";

const AdminUpdatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    username: data?.username || "",
    email: data?.email || "",
    mobile: data?.mobile || "",
    oldPassword: "",
    newPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for admin users
    if (data.role === "admin") {
      if (!formData.username || !formData.email || !formData.mobile) {
        setError("Please fill in all required fields");
        return;
      }
    } else if (!formData.username) {
      // Validation for non-admin users
      setError("Please fill in username");
      return;
    }

    // Password validation for all users
    if (
      (formData.oldPassword || formData.newPassword) &&
      (!formData.oldPassword || !formData.newPassword)
    ) {
      setError("Please fill both password fields");
      return;
    }

    try {
      let response;

      if (data.role === "admin") {
        console.log("update");
        response = await dispatch(
          updateAdmin({
            adminId: data.id,
            updatedData: formData,
          })
        ).unwrap();
      }
      // Case 2: Managers - update password with "user" resource
      else if (
        data.role === "gov_manager" ||
        data.role === "op_manager" ||
        data.role === "kap_employee"
      ) {
        console.log(data.id);
        response = await dispatch(
          updatePassword({
            id: data.id,
            data: {
              oldPassword: formData.oldPassword,
              newPassword: formData.newPassword,
            },
            resource: "user",
          })
        ).unwrap();
      }
      // Case 3: Employees - update password with "employee" resource
      else {
        response = await dispatch(
          updatePassword({
            id: data.id,
            data: {
              oldPassword: formData.oldPassword,
              newPassword: formData.newPassword,
            },
            resource: "employee",
          })
        ).unwrap();
      }

      if (response?.success) {
        localStorage.removeItem("user");
        localStorage.removeItem("data");
        window.location.reload();
        navigate("/login");
      } else {
        setError(response?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message || "Failed to update profile");
    }
  };

  const handleSkip = (e) => {
    e.preventDefault();
    if (data?.role) {
      const roleRoutes = {
        admin: "/admin-home",
        gov_manager: "/govsector-manager-home",
        op_manager: "/op-manager-home",
        kap_employee: "/kap-employee-home",
        op_employee: "/op-employee-home",
        gov_employee: "/gov-employee-home",
      };
      navigate(roleRoutes[data.role] || "/login");
    }
  };

  return (
    <div className="flex items-center align-middle h-full justify-center mt-5">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img
            src={Logo}
            alt="Company Logo"
            className="h-20 w-20 rounded-full"
          />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Update Information
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Username:"
            name="username"
            placeholder="Enter new username"
            value={formData.username}
            onChange={handleChange}
            className="mb-4"
            required
          />

          {data?.role === "admin" && (
            <>
              <InputField
                label="Email:"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="mb-4"
                required
              />

              <InputField
                label="Mobile Number:"
                name="mobile"
                placeholder="Enter your mobile number"
                value={formData.mobile}
                onChange={handleChange}
                className="mb-4"
                required
              />
            </>
          )}

          <InputField
            label="Current Password:"
            name="oldPassword"
            type="password"
            placeholder="Enter current password"
            value={formData.oldPassword}
            onChange={handleChange}
            className="mb-4"
          />

          <InputField
            label="New Password:"
            name="newPassword"
            type="password"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            className="mb-4"
          />

          <div className="flex justify-between">
            <Button
              text="Skip"
              onClick={handleSkip}
              className="w-1/2 bg-gray-500 hover:bg-gray-700 mr-2"
              type="button"
            />
            <Button
              text="Update"
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
