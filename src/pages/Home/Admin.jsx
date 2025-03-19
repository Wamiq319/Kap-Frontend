import React from "react";

const AdminHomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Heading moved to the top, no background */}
      <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6">
        The Control Panel of KAP
      </h2>

      {/* Control Panel Box */}
      <div className="bg-gray-300 p-6 rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl">
        {/* Buttons */}
        <button className="w-full bg-gray-600 text-white text-lg font-semibold py-3 rounded-md mb-4 shadow hover:bg-gray-700 transition">
          Add KAP companies
        </button>

        <button className="w-full bg-green-600 text-white text-lg py-3 rounded-md mb-4 shadow hover:bg-green-700 transition">
          Add Government Sector
        </button>

        <button className="w-full bg-blue-600 text-white text-lg py-3 rounded-md mb-4 shadow hover:bg-blue-700 transition">
          Add operating companies
        </button>

        <button className="w-full bg-orange-500 text-white text-lg py-3 rounded-md shadow hover:bg-orange-600 transition">
          Add / remove employees
        </button>
      </div>
    </div>
  );
};

export default AdminHomePage;
