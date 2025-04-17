import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/FormComponents"; // Import your Button component
import { logo } from "../../assets";
import { useSelector } from "react-redux";

const ManageEmployeePage = () => {
  const navigate = useNavigate();
  const words = useSelector((state) => state.lang.words);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Control Panel Box */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-300 p-6 rounded-lg shadow-lg space-y-6">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Company Logo"
            className="h-40 w-40 rounded-full"
          />
        </div>

        <Button
          text={words["Manage Government Managers"]}
          onClick={() => handleNavigation("/add-govManager")}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 shadow"
        />
        <Button
          text={words["Manage Government Employees"]}
          onClick={() => handleNavigation("/add_gov_employee")}
          className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-3 shadow"
        />
        <Button
          text={words["Manage Company Managers"]}
          onClick={() => handleNavigation("/add-companyManager")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 shadow"
        />
        <Button
          text={words["Manage Company Employees"]}
          onClick={() => handleNavigation("/add_op_employee")}
          className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-3 shadow"
        />
      </div>
    </div>
  );
};

export default ManageEmployeePage;
