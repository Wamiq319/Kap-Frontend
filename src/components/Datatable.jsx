import React, { useState } from "react";

const DataTable = ({
  heading,
  tableHeader,
  tableData,
  buttons,
  rowsPerPage = 5,
  headerBgColor = "bg-gray-200",
  bulkActions = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  // Calculate Total Pages
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  // Paginate Data
  const paginatedData = tableData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle Pagination Change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleRowSelection = (rowId) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((row) => row.id));
    }
  };

  return (
    <div className="overflow-hidden rounded-lg shadow-lg border border-gray-300 bg-white p-4">
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-left font-bold">{heading}</h2>
          {bulkActions.length > 0 && (
            <div className="flex gap-2">
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick(selectedRows)}
                  className={`${action.className} flex items-center justify-center p-2 rounded-md shadow`}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          )}
        </div>
        <table className="min-w-full border-collapse border border-gray-300">
          {/* Table Headings */}
          <thead className={`${headerBgColor} text-gray-700`}>
            <tr>
              <th className="py-1 px-2 text-left border border-gray-300">
                <input
                  type="checkbox"
                  checked={selectedRows.length === paginatedData.length}
                  onChange={handleSelectAll}
                />
              </th>
              {tableHeader.map((header, index) => (
                <th
                  key={index}
                  className="py-1 px-2 text-left border border-gray-300"
                >
                  {header.label}
                </th>
              ))}
              {buttons?.length > 0 && (
                <>
                  {buttons.map((button, btnIndex) => (
                    <th
                      key={btnIndex}
                      className="py-1 px-2 text-left border border-gray-300"
                    >
                      {button.text}
                    </th>
                  ))}
                </>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedData.map((row) => (
              <tr
                key={row.id}
                className="border border-gray-300 even:bg-gray-50 odd:bg-white"
              >
                <td className="py-1 px-2 border border-gray-300">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowSelection(row.id)}
                  />
                </td>
                {tableHeader.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="py-1 px-2 border border-gray-300"
                  >
                    {col.key === "image" ? (
                      <img
                        src={row[col.key] || "https://via.placeholder.com/50"}
                        className="h-10 w-10 object-contain rounded-full"
                        alt="Logo"
                      />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                {/* Action Buttons */}
                {buttons?.length > 0 &&
                  buttons.map((button, btnIndex) => (
                    <td
                      key={btnIndex}
                      className="p-2 border border-gray-300 text-center"
                    >
                      <button
                        onClick={() => button.onClick(row)} // Passes full row data
                        className={`${button.className} flex items-center justify-center p-2 rounded-md shadow`}
                      >
                        {button.icon && <span>{button.icon}</span>}
                      </button>
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-3 bg-white flex justify-between items-center border-t border-gray-300">
        <span className="font-bold text-gray-600">
          Total Records: {tableData.length}
        </span>
        <div>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-300 rounded-md font-semibold mx-1 disabled:opacity-50"
          >
            &lt;
          </button>
          <span className="font-bold text-gray-700 mx-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 bg-gray-300 rounded-md font-semibold mx-1 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
