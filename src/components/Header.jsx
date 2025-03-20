import React from "react";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null; // Hide header if not logged in

  return (
    <div className="bg-blue-600 text-white py-1 px-2 shadow-md flex items-center justify-between ">
      <button onClick={() => navigate("/admin-home")} className="ml-4">
        <FaHome
          size={24}
          className="text-white hover:text-gray-200 transition"
        />
      </button>

      <h1 className="text-lg font-semibold text-center flex-grow">
        KAP Control Panel
      </h1>
      <span className="text-md font-semibold">{user.username}</span>
    </div>
  );
};

export default Header;
