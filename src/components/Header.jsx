import React from "react";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice"; // Import logout action

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.auth);

  if (!data) return null;

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="bg-blue-600 text-white py-1 px-2 shadow-md flex items-center justify-between">
      <button onClick={() => navigate("/admin-home")} className="ml-4">
        <FaHome
          size={24}
          className="text-white hover:text-gray-200 transition"
        />
      </button>

      <h1 className="md:text-lg text-base font-semibold text-center flex-grow">
        {data.username} Control Panel
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
