import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/FormComponents"; // Import your Button component
import logo from "../../assets/logo.png";

const AdminHomePage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4 ">
      {/* Control Panel Box */}
      <div className="bg-gray-300 p-6 rounded-lg shadow-lg  max-w-md md:max-w-lg lg:max-w-xl space-y-6">
        {/* Buttons */}

        <div className="flex  flex-col">
          <div className="flex justify-center">
            <img src={logo} alt="Company Logo" className="h-40 w-40" />
          </div>
        </div>

        <Button
          text="Add KAP companies"
          onClick={() => handleNavigation("/add-kap")}
          className="w-full bg-gray-600 hover:bg-gray-700 text-lg font-semibold py-3 shadow"
        />

        <Button
          text="Add Government Sector"
          onClick={() => handleNavigation("/add-government-sector")}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 shadow"
        />

        <Button
          text="Add operating companies"
          onClick={() => handleNavigation("/add-operating-companies")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 shadow"
        />

        <Button
          text="Add / remove employees"
          onClick={() => handleNavigation("/manage-employees")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3 shadow"
        />
      </div>
    </div>
  );
};

export default AdminHomePage;
