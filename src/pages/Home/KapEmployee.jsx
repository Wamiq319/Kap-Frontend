import { useNavigate } from "react-router-dom";
import React from "react";
import { Button } from "../../components";
import { useSelector } from "react-redux";
import { logo } from "../../assets";

const KAPEmployeeHomePage = () => {
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.auth);

  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4  ">
      {/* Control Panel Box */}
      <div className="bg-gray-300 p-6 rounded-lg  px-16 shadow-lg  max-w-md md:max-w-lg lg:max-w-xl space-y-2">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex justify-center  bg-white rounded-full shadow-lg">
            <img
              src={logo}
              alt="Company Logo"
              className="h-32 w-32 rounded-full"
            />
          </div>

          <div className="text-center">
            <h4 className="text-2xl font-bold text-gray-800">
              {data.jobTitle}
            </h4>
            {data?.role && (
              <p className="text-sm text-gray-500 mt-1">
                Kap Employee Dashboard
              </p>
            )}
          </div>
        </div>
        <Button
          text="Manage Tickets"
          onClick={() => handleNavigation("/manage-kap-tickets")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 shadow"
        />
        <Button
          text="Track Tickets"
          onClick={() => handleNavigation("/track-kap-tickets")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 shadow"
        />
      </div>
    </div>
  );
};

export default KAPEmployeeHomePage;
