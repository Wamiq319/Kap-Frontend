import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEntities,
  fetchNames,
  updateEntity,
} from "../../redux/adminCrudSlice";
import {
  DataTable,
  ToastNotification,
  Loader,
  Modal,
  Button,
  InputField,
  ConfirmationModal,
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

  const [modals, setModals] = useState({
    addNoteModal: {
      isOpen: false,
      ticketId: null,
      note: "",
    },
    confirmAction: {
      isOpen: false,
      message: "",
      onConfirm: null,
    },
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

  const showConfirmation = (message, onConfirm) => {
    setModals((prev) => ({
      ...prev,
      confirmAction: {
        isOpen: true,
        message,
        onConfirm,
      },
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

  const handleThankYouLetter = async () => {
    showConfirmation(
      "Are you sure you want to send a thank you letter and close this ticket?",
      async () => {
        try {
          setUiState((prev) => ({ ...prev, isLoading: true }));

          // Send thank you letter via API
          const thankYouResponse = await dispatch(
            updateEntity({
              endpoint: "tkt/send-thank-you",
              id: selectedTicket._id,
              data: {
                sentBy: user.name,
              },
            })
          ).unwrap();

          if (!thankYouResponse.success) {
            throw new Error("Failed to send thank you letter");
          }

          // Close the ticket
          const closeResponse = await dispatch(
            updateEntity({
              endpoint: "tkt/status",
              id: selectedTicket._id,
              data: {
                status: "Closed",
                closedBy: user.name,
                closedAt: new Date().toISOString(),
              },
            })
          ).unwrap();

          if (closeResponse.success) {
            showToast(
              "Thank you letter sent and ticket closed successfully",
              "success"
            );
            fetchData();
            setIsFollowupModalOpen(false);
          }
        } catch (error) {
          showToast(
            error.message || "Failed to send thank you letter",
            "error"
          );
        } finally {
          setUiState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    );
  };

  const handleAddNote = () => {
    setModals((prev) => ({
      ...prev,
      addNoteModal: {
        isOpen: true,
        ticketId: selectedTicket._id,
        note: "",
      },
    }));
  };

  const handleSubmitNote = async () => {
    const { ticketId, note } = modals.addNoteModal;

    showConfirmation("Are you sure you want to add this note?", async () => {
      try {
        setUiState((prev) => ({ ...prev, isLoading: true }));

        const response = await dispatch(
          updateEntity({
            endpoint: "tkt/add-note",
            id: ticketId,
            data: {
              text: note,
              addedBy: "KAP:" + user.name,
            },
          })
        ).unwrap();

        if (response.success) {
          showToast("Note added successfully", "success");
          // Close the note modal
          setModals((prev) => ({
            ...prev,
            addNoteModal: {
              isOpen: false,
              ticketId: null,
              note: "",
            },
          }));
          // Refresh the ticket data
          await fetchData();
          // Re-open the ticket details modal to show updated notes
          if (selectedTicket) {
            setIsFollowupModalOpen(true);
          }
        } else {
          throw new Error(response.message || "Failed to add note");
        }
      } catch (error) {
        showToast(error.message || "Failed to add note", "error");
      } finally {
        setUiState((prev) => ({ ...prev, isLoading: false }));
      }
    });
  };

  const handleCloseTicket = async () => {
    showConfirmation(
      "Are you sure you want to close this ticket?",
      async () => {
        try {
          setUiState((prev) => ({ ...prev, isLoading: true }));

          const response = await dispatch(
            updateEntity({
              endpoint: "tkt/status",
              id: selectedTicket._id,
              data: {
                status: "Closed",
                closedBy: user.name,
                closedAt: new Date().toISOString(),
              },
            })
          ).unwrap();

          if (response.success) {
            showToast("Ticket closed successfully", "success");
            fetchData();
            setIsFollowupModalOpen(false);
          }
        } catch (error) {
          showToast(error.message || "Failed to close ticket", "error");
        } finally {
          setUiState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    );
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

      {/* Ticket Details Modal */}
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
                <div className="detail-row">
                  <span className="detail-label">TicketBuilder:</span>
                  <span>{selectedTicket.ticketBuilder}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">TicketRecienpt:</span>
                  <span>
                    {selectedTicket.ticketReciept
                      ? selectedTicket.ticketReciept
                      : "N/A"}
                  </span>
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
                        {note.text} - <em>{note.addedBy}</em>
                        <span className="text-gray-500 text-sm ml-2">
                          ({new Date(note.date).toLocaleString()})
                        </span>
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
                text="Thank You"
                className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-[150px]"
                onClick={handleThankYouLetter}
              />
              <Button
                text="Add Note"
                className="bg-gray-600 hover:bg-gray-700 flex-1 min-w-[150px]"
                onClick={handleAddNote}
              />
              <Button
                text="Print Report"
                className="bg-purple-600 hover:bg-purple-700 flex-1 min-w-[150px]"
                onClick={handlePrint}
              />
              <Button
                text="Close Ticket"
                className={`flex-1 min-w-[150px] ${
                  selectedTicket.status === "Closed"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={
                  selectedTicket.status === "Closed"
                    ? undefined
                    : handleCloseTicket
                }
                disabled={selectedTicket.status === "Closed"}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={modals.addNoteModal?.isOpen || false}
        onClose={() =>
          setModals((prev) => ({
            ...prev,
            addNoteModal: {
              isOpen: false,
              ticketId: null,
              note: "",
            },
          }))
        }
        title="Add Note"
      >
        <div className="space-y-4">
          <InputField
            label="Note"
            type="textarea"
            rows={4}
            value={modals.addNoteModal?.note || ""}
            onChange={(e) =>
              setModals((prev) => ({
                ...prev,
                addNoteModal: {
                  ...prev.addNoteModal,
                  note: e.target.value,
                },
              }))
            }
            placeholder="Enter your note..."
          />
          <div className="flex justify-end gap-2">
            <Button
              text="Cancel"
              type="button"
              onClick={() =>
                setModals((prev) => ({
                  ...prev,
                  addNoteModal: {
                    isOpen: false,
                    ticketId: null,
                    note: "",
                  },
                }))
              }
              className="bg-gray-500 hover:bg-gray-700"
            />
            <Button
              text="Add Note"
              type="button"
              onClick={handleSubmitNote}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={uiState.isLoading || !modals.addNoteModal?.note.trim()}
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modals.confirmAction.isOpen}
        onClose={() =>
          setModals((prev) => ({
            ...prev,
            confirmAction: {
              ...prev.confirmAction,
              isOpen: false,
            },
          }))
        }
        onConfirm={() => {
          modals.confirmAction.onConfirm();
          setModals((prev) => ({
            ...prev,
            confirmAction: {
              ...prev.confirmAction,
              isOpen: false,
            },
          }));
        }}
        title="Confirm Action"
        message={modals.confirmAction.message}
      />
    </div>
  );
};

export default TrackKapTicketPage;
