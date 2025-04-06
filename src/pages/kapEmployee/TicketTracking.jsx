import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEntities, fetchNames } from "../../redux/adminCrudSlice";
import {
  DataTable,
  ToastNotification,
  Loader,
  Modal,
  Button,
} from "../../components";

const TrackKapTicketPage = () => {
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);
  const user = JSON.parse(localStorage.getItem("user"));

  const [requestors, setRequestors] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);

  const [uiState, setUiState] = useState({
    showToast: false,
    toastMessage: "",
    toastType: "success",
    isLoading: false,
  });

  const tableHeaders = [
    { key: "index", label: "#" },
    { key: "requestTime", label: "Request Time" },
    { key: "ticketNumber", label: "Ticket Number" },
    { key: "location", label: "Location" },
    { key: "operator", label: "Operator" },
    { key: "requestor", label: "Requestor" },
    { key: "orderDate", label: "Order Creation" },
    { key: "attachment", label: "Attachment" },
    { key: "completionPercentage", label: "Completion %" },
    { key: "followup", label: "Follow Up" },
  ];

  const fetchData = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));

      const requestorResponse = await dispatch(
        fetchNames({ endpoint: "gov/sector-names" })
      );
      setRequestors(requestorResponse.payload?.names || []);

      const operatorResponse = await dispatch(
        fetchNames({ endpoint: "op/company-names" })
      );
      setOperators(operatorResponse.payload?.names || []);

      await dispatch(
        fetchEntities({
          endpoint: "tkt/tickets",
          params: {
            userRole: "kap_employee",
            userId: user.company?.id ?? null,
          },
        })
      );
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const tableData = entities?.map((item, index) => ({
    index: index + 1,
    id: item._id,
    requestTime: item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "",
    ticketNumber: item.ticketNumber,
    location: item.location,
    operator: item.operator,
    requestor: item.requestor,
    orderDate: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString()
      : "",
    attachment: item.attachment ? "File Attached" : "No Attachment",
    completionPercentage: {
      percentage:
        item.progress?.length > 0
          ? Math.max(...item.progress.map((p) => p.percentage))
          : 0,
    },
    followup: {
      onClick: () => {
        setSelectedTicket(item);
        setIsFollowupModalOpen(true);
      },
    },
  }));

  const showToast = (message, type) => {
    setUiState((prev) => ({
      ...prev,
      toastMessage: message,
      toastType: type,
      showToast: true,
    }));
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Report - ${selectedTicket?.ticketNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .ticket-details { margin-bottom: 20px; }
            .detail-row { display: flex; margin-bottom: 8px; }
            .detail-label { font-weight: bold; width: 180px; }
            .progress-item { margin-bottom: 5px; }
            .notes-item { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="p-4">
      {uiState.showToast && (
        <ToastNotification
          message={uiState.toastMessage}
          type={uiState.toastType}
          onClose={() => setUiState((prev) => ({ ...prev, showToast: false }))}
        />
      )}

      {uiState.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={8} opacity={90} />
        </div>
      ) : (
        <DataTable
          heading="Tickets"
          tableHeader={tableHeaders}
          tableData={tableData}
          headerBgColor="bg-gray-200"
          rowHoverEffect={true}
          showProgressBar={true}
        />
      )}

      {/* Follow Up Modal */}
      <Modal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        title={`Ticket Details - ${selectedTicket?.ticketNumber || ""}`}
        size="md"
      >
        {selectedTicket && (
          <div>
            <div id="print-content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="detail-row">
                  <span className="detail-label">Request Type:</span>
                  <span>{selectedTicket.requestType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span>{selectedTicket.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Operator:</span>
                  <span>{selectedTicket.operator}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requestor:</span>
                  <span>{selectedTicket.requestor}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ticket Number:</span>
                  <span>{selectedTicket.ticketNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created At:</span>
                  <span>
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expected Completion:</span>
                  <span>
                    {selectedTicket.expectedCompletionDate
                      ? new Date(
                          selectedTicket.expectedCompletionDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span>{selectedTicket.status}</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Progress:</h3>
                {selectedTicket.progress?.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedTicket.progress.map((item, index) => (
                      <li key={index} className="progress-item">
                        <strong>{item.percentage}%</strong> - {item.observation}
                        <span className="text-gray-500 text-sm ml-2">
                          ({new Date(item.date).toLocaleString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No progress updates yet</p>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Notes:</h3>
                {selectedTicket.notes?.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedTicket.notes.map((note, index) => (
                      <li key={index} className="notes-item">
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No notes yet</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-between mt-6 print-hidden">
              <Button
                text="Archive"
                className="bg-yellow-600 hover:bg-yellow-700 flex-1 min-w-[150px]"
                onClick={() => console.log("Archive clicked")}
              />
              <Button
                text="Thank You"
                className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-[150px]"
                onClick={() => console.log("Thank You Letter clicked")}
              />
              <Button
                text="Add Note"
                className="bg-gray-600 hover:bg-gray-700 flex-1 min-w-[150px]"
                onClick={() => console.log("Add Note clicked")}
              />
              <Button
                text="Print Report"
                className="bg-purple-600 hover:bg-purple-700 flex-1 min-w-[150px]"
                onClick={handlePrint}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrackKapTicketPage;
