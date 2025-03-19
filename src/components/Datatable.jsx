import React from "react";

const DataTable = ({ headings, data, onActionClick }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border border-gray-300 shadow-md">
        {/* Table Headings */}
        <thead className="bg-gray-200">
          <tr>
            {headings.map((heading, index) => (
              <th
                key={index}
                className="py-3 px-4 text-left border-b border-gray-300"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-300">
              {Object.keys(row).map((key, colIndex) => (
                <td key={colIndex} className="py-2 px-4">
                  {/* Render Image */}
                  {key === "image" ? (
                    <img
                      src={row[key]}
                      alt="logo"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
              {/* Action Button */}
              <td className="py-2 px-4">
                <button
                  onClick={() => onActionClick(row)}
                  className="bg-red-500 text-white px-4 py-1 rounded-md shadow hover:bg-red-600"
                >
                  Action
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
