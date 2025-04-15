import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../../components/FormComponents";
import { logo } from "../../assets";

const AdminHomePage = () => {
  const navigate = useNavigate();
  const words = useSelector((state) => state.lang.words);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Control Panel Box - fixed minimum width that won't shrink */}
      <div className="bg-gray-300 p-6 rounded-lg shadow-lg min-w-[320px] w-full max-w-md md:max-w-lg lg:max-w-xl space-y-6">
        {/* Logo */}
        <div className="flex flex-col">
          <div className="flex justify-center">
            <img
              src={logo}
              alt={words["Company Logo"]}
              className="h-40 w-40 rounded-full"
            />
          </div>
        </div>

        {/* Buttons - kept your original button styling */}
        <Button
          text={words["Manage KAP"]}
          onClick={() => handleNavigation("/add-kapEmployee")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-lg font-semibold py-3 shadow"
        />

        <Button
          text={words["Manage Government Sectors"]}
          onClick={() => handleNavigation("/add-govSector")}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 shadow"
        />

        <Button
          text={words["Manage operating companies"]}
          onClick={() => handleNavigation("/add-operatingCompany")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 shadow"
        />

        <Button
          text={words["Manage managers/employees"]}
          onClick={() => handleNavigation("/manage-employees")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3 shadow"
        />
      </div>
    </div>
  );
};

export default AdminHomePage;
