import React from "react";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const navigate = useNavigate();
  const user =
    useSelector((state) => state.auth.data) ||
    JSON.parse(localStorage.getItem("user"));

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("data");
    window.location.reload();
    navigate("/login");
  };

  // Handle Home navigation based on user role
  const handleHomeClick = () => {
    if (!user || !user.role) {
      navigate("/login");
      return;
    }

    switch (user.role) {
      case "admin":
        navigate("/admin-home");
        break;
      case "op_manager":
        navigate("/op-manager-home");
        break;
      case "op_employee":
        navigate("/employee-home");
        break;
      case "kap_employee":
        navigate("/kap-employee-home");
        break;
      case "gov_manager":
        navigate("/govsector-manager-home");
      default:
        navigate("/login");
    }
  };

  return (
    <div className="bg-blue-600 text-white py-1 px-2 shadow-md flex items-center justify-between">
      <button onClick={handleHomeClick} className="ml-4">
        <FaHome
          size={24}
          className="text-white hover:text-gray-200 transition"
        />
      </button>

      <h1 className="md:text-lg text-base font-semibold text-center flex-grow">
        Kap Control Panel
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
