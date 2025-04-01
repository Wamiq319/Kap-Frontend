import { useNavigate } from "react-router-dom";
import React from "react";
import { Button } from "../../components";

const GovSectorManagerHomePage = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4 ">
      {/* Control Panel Box */}
      <div className="bg-gray-300 p-6 rounded-lg shadow-lg  max-w-md md:max-w-lg lg:max-w-xl space-y-6">
        {/* Buttons */}

        <Button
          text="Manage Employees"
          onClick={() => handleNavigation("/add-govEmployee")}
          className="w-full bg-green-600 hover:bg-green-700 text-lg font-semibold py-3 shadow"
        />

        <Button
          text="Manage Tickets"
          onClick={() => handleNavigation("/manage-gov-tickets")}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 shadow"
        />
      </div>
    </div>
  );
};

export default GovSectorManagerHomePage;
