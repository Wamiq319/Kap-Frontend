import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaExchangeAlt, FaCheck, FaEye, FaStickyNote } from "react-icons/fa";
import { fetchEntities, updateEntity } from "../../redux/slices/adminCrudSlice";
import { getUsers } from "../../redux/slices/authSlice";
import {
  DataTable,
  Button,
  ToastNotification,
  Modal,
  Loader,
  Dropdown,
  ConfirmationModal,
  InputField,
} from "../../components";
import { use } from "react";

const ManageOpTicketsPage = () => {
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);
  const { users } = useSelector((state) => state.auth);
  const user = JSON.parse(localStorage.getItem("user"));

  const [uiState, setUiState] = useState({
    showToast: false,
    toastMessage: "",
    toastType: "success",
    isLoading: false,
  });

  const [modals, setModals] = useState({
    assign: {
      isOpen: false,
      ticketId: null,
      employeeId: "",
      currentAssignee: null,
      ticketStatus: null,
    },
    viewProgress: { isOpen: false, ticket: null },
    viewNotes: { isOpen: false, ticket: null },
  });

  const [confirmAction, setConfirmAction] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
    data: null,
  });

  // Main tickets table headers
  const tableHeaders = [
    { key: "index", label: "#" },
    { key: "requestType", label: "Request Type" },
    { key: "ticketNumber", label: "Ticket Number" },
    { key: "location", label: "Location" },
    { key: "requestor", label: "Requestor" },
    { key: "expectedCompletionDate", label: "Expected Completion" },
    { key: "status", label: "Ticket Status" },
  ];

  const progressHeaders = [
    { key: "index", label: "#" },
    { key: "percentage", label: "Progress" },
    { key: "date", label: "Date" },
    { key: "observation", label: "Observation" },
  ];

  const notesHeaders = [
    { key: "index", label: "#" },
    { key: "date", label: "Date" },
    { key: "addedBy", label: "Added By" },
    { key: "note", label: "Note" },
  ];

  const fetchData = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await dispatch(
        fetchEntities({
          endpoint: "tkt/tickets",
          params: {
            userRole: "op_manager",
            userId: user.company?.id ?? null,
          },
        })
      );
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const fetchEmployees = async () => {
    try {
      await dispatch(
        getUsers({
          resource: "employee",
          endpoint: "get-employees",
          queryParams: {
            role: "op_employee",
            entityId: user.company?.id,
          },
        })
      );
    } catch (error) {
      showToast("Failed to load employees", "error");
    }
  };

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, [dispatch]);
  console.log(user);
  const formatTableData = () => {
    return entities?.map((item, index) => ({
      index: index + 1,
      id: item._id,
      requestType: item.requestType,
      ticketNumber: item.ticketNumber,
      location: item.location,
      requestor: item.requestor,
      expectedCompletionDate: item.expectedCompletionDate
        ? new Date(item.expectedCompletionDate).toLocaleDateString()
        : "",
      status: item.status,
      opTransferReq: item.opTransferReq,
    }));
  };

  const formatProgressData = (progress) => {
    if (!progress || !Array.isArray(progress)) return [];

    const sortedProgress = [...progress].sort((a, b) => {
      const dateA = new Date(a.date || Date.now());
      const dateB = new Date(b.date || Date.now());
      return dateB - dateA;
    });

    return sortedProgress.map((item, index) => ({
      index: index + 1,
      percentage: `${item.percentage}%`,
      date: item.date ? new Date(item.date).toLocaleString() : "Unknown date",
      observation: item.observation || "-",
    }));
  };

  const formatNotesData = (notes) => {
    if (!notes || !Array.isArray(notes)) return [];

    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = new Date(a.date || Date.now());
      const dateB = new Date(b.date || Date.now());
      return dateB - dateA;
    });

    return sortedNotes.map((item, index) => ({
      index: index + 1,
      date: item.date ? new Date(item.date).toLocaleString() : "Unknown date",
      addedBy: item.addedBy || "Unknown",
      note: item.text || "-",
    }));
  };

  const handleViewProgress = (tableRow) => {
    const ticket = entities.find((entity) => entity._id === tableRow.id);
    if (!ticket) {
      showToast("Ticket data not found", "error");
      return;
    }
    setModals((prev) => ({
      ...prev,
      viewProgress: {
        isOpen: true,
        ticket,
      },
    }));
  };

  const handleViewNotes = (tableRow) => {
    const ticket = entities.find((entity) => entity._id === tableRow.id);
    if (!ticket) {
      showToast("Ticket data not found", "error");
      return;
    }
    setModals((prev) => ({
      ...prev,
      viewNotes: {
        isOpen: true,
        ticket,
      },
    }));
  };

  const handleAssign = (ticket) => {
    const fullTicket = entities.find((e) => e._id === ticket.id);

    if (fullTicket.status === "Completed") {
      showToast("Cannot assign completed ticket", "error");
      return;
    }

    setModals((prev) => ({
      ...prev,
      assign: {
        isOpen: true,
        ticketId: ticket.id,
        employeeId: fullTicket?.assignedTo?._id || "",
        currentAssignee: fullTicket?.assignedTo || null,
        ticketStatus: fullTicket.status,
        opTransferRequest: fullTicket.opTransferReq,
      },
    }));
  };

  const handleAcceptTicket = async () => {
    showConfirmation(
      "Are you sure you want to accept this ticket?",
      async () => {
        try {
          setUiState((prev) => ({ ...prev, isLoading: true }));

          const response = await dispatch(
            updateEntity({
              endpoint: "tkt/status",
              id: modals.assign.ticketId,
              data: { status: "In Progress", acceptedBy: user.name },
            })
          ).unwrap();

          if (response.success) {
            showToast("Ticket accepted successfully", "success");
            fetchData();
            setModals((prev) => ({
              ...prev,
              assign: {
                isOpen: false,
                ticketId: null,
                employeeId: "",
                currentAssignee: null,
                ticketStatus: null,
              },
            }));
          }
        } catch (error) {
          showToast(error.message || "Failed to accept ticket", "error");
        } finally {
          setUiState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    );
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (!modals.assign.employeeId) {
      showToast("Please select an employee", "error");
      return;
    }

    showConfirmation(
      "Are you sure you want to assign this ticket?",
      async () => {
        try {
          setUiState((prev) => ({ ...prev, isLoading: true }));
          const response = await dispatch(
            updateEntity({
              endpoint: "tkt/assign",
              id: modals.assign.ticketId,
              data: {
                assignedToId: modals.assign.employeeId,
                assigneeType: "opEmployee",
              },
            })
          ).unwrap();

          if (response.success) {
            showToast(response.message, "success");
            fetchData();
            setModals((prev) => ({
              ...prev,
              assign: {
                isOpen: false,
                ticketId: null,
                employeeId: "",
                currentAssignee: null,
                ticketStatus: null,
              },
            }));
          }
        } catch (error) {
          showToast(error.message || "Assignment failed", "error");
        } finally {
          setUiState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    );
  };

  const showToast = (message, type) => {
    setUiState((prev) => ({
      ...prev,
      toastMessage: message,
      toastType: type,
      showToast: true,
    }));
  };

  const showConfirmation = (message, onConfirm, data = null) => {
    setConfirmAction({
      isOpen: true,
      message,
      onConfirm,
      data,
    });
  };

  const employeeOptions =
    users?.map((user) => ({
      value: user.id,
      label: user.name,
    })) || [];

  return (
    <div className="p-4">
      {/* Assign Modal */}
      <Modal
        isOpen={modals.assign.isOpen}
        onClose={() =>
          setModals((prev) => ({
            ...prev,
            assign: {
              isOpen: false,
              ticketId: null,
              employeeId: "",
              currentAssignee: null,
              ticketStatus: null,
            },
          }))
        }
        title={
          modals.assign.ticketStatus === "Open"
            ? "Accept Ticket"
            : "Transfer Ticket"
        }
      >
        {modals.assign.ticketStatus === "Open" ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              First, accept the ticket to mark it as 'In Progress,' then you can
              assign it.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                text="Cancel"
                type="button"
                onClick={() =>
                  setModals((prev) => ({
                    ...prev,
                    assign: {
                      isOpen: false,
                      ticketId: null,
                      employeeId: "",
                      currentAssignee: null,
                      ticketStatus: null,
                    },
                  }))
                }
                className="bg-gray-500 hover:bg-gray-700"
              />
              <Button
                text={uiState.isLoading ? "Processing..." : "Accept Ticket"}
                type="button"
                onClick={handleAcceptTicket}
                className="bg-green-600 hover:bg-green-700"
                disabled={uiState.isLoading}
                icon={<FaCheck className="mr-2" />}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            {modals.assign?.opTransferRequest && (
              <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                <h3 className="font-semibold text-red-700">
                  Transfer Request: {modals.assign.opTransferRequest}
                </h3>
              </div>
            )}
            {modals.assign.currentAssignee && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <h3 className="font-semibold">
                  Currently Assigned: {modals.assign.currentAssignee}
                </h3>
              </div>
            )}

            <Dropdown
              label={
                modals.assign.currentAssignee ? "Reassign to" : "Assign to"
              }
              options={employeeOptions}
              selectedValue={modals.assign.employeeId}
              onChange={(value) =>
                setModals((prev) => ({
                  ...prev,
                  assign: { ...prev.assign, employeeId: value },
                }))
              }
            />

            <div className="flex justify-end gap-2">
              <Button
                text="Cancel"
                type="button"
                onClick={() =>
                  setModals((prev) => ({
                    ...prev,
                    assign: {
                      isOpen: false,
                      ticketId: null,
                      employeeId: "",
                      currentAssignee: null,
                      ticketStatus: null,
                    },
                  }))
                }
                className="bg-gray-500 hover:bg-gray-700"
              />
              <Button
                text={
                  uiState.isLoading ? "Processing..." : "Confirm Assignment"
                }
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={uiState.isLoading}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* View Progress Modal */}
      <Modal
        isOpen={modals.viewProgress.isOpen}
        onClose={() =>
          setModals((prev) => ({
            ...prev,
            viewProgress: { ...prev.viewProgress, isOpen: false },
          }))
        }
        title="Progress History"
        size="lg"
      >
        {modals.viewProgress.ticket && (
          <div className="space-y-4">
            <DataTable
              tableHeader={progressHeaders}
              tableData={formatProgressData(
                modals.viewProgress.ticket.progress
              )}
              emptyMessage="No progress history available"
              className="shadow-sm"
              headerBgColor="bg-blue-100"
              rowsPerPage={5}
            />
            <div className="flex justify-end">
              <Button
                text="Close"
                onClick={() =>
                  setModals((prev) => ({
                    ...prev,
                    viewProgress: { ...prev.viewProgress, isOpen: false },
                  }))
                }
                className="bg-gray-500 hover:bg-gray-600 px-6 py-2"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* View Notes Modal */}
      <Modal
        isOpen={modals.viewNotes.isOpen}
        onClose={() =>
          setModals((prev) => ({
            ...prev,
            viewNotes: { ...prev.viewNotes, isOpen: false },
          }))
        }
        title="Ticket Notes"
        size="lg"
      >
        {modals.viewNotes.ticket && (
          <div className="space-y-4">
            <DataTable
              tableHeader={notesHeaders}
              tableData={formatNotesData(modals.viewNotes.ticket.notes)}
              emptyMessage="No notes available"
              className="shadow-sm"
              headerBgColor="bg-blue-100"
              rowsPerPage={5}
            />
            <div className="flex justify-end">
              <Button
                text="Close"
                onClick={() =>
                  setModals((prev) => ({
                    ...prev,
                    viewNotes: { ...prev.viewNotes, isOpen: false },
                  }))
                }
                className="bg-gray-500 hover:bg-gray-600 px-6 py-2"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
        onConfirm={() => {
          confirmAction.onConfirm();
          setConfirmAction({ ...confirmAction, isOpen: false });
        }}
        title="Confirm Action"
        message={confirmAction.message}
      />

      {/* Toast Notification */}
      {uiState.showToast && (
        <ToastNotification
          message={uiState.toastMessage}
          type={uiState.toastType}
          onClose={() => setUiState((prev) => ({ ...prev, showToast: false }))}
        />
      )}

      {/* Main Tickets Table */}
      {uiState.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={8} opacity={90} />
        </div>
      ) : (
        <DataTable
          heading="Tickets Assigned to your Company"
          tableHeader={tableHeaders}
          tableData={formatTableData()}
          headerBgColor="bg-gray-200"
          rowHoverEffect={true}
          buttons={[
            {
              text: "View Progress",
              icon: <FaEye className="text-blue-500" />,
              className: "bg-blue-100 hover:bg-blue-200",
              onClick: handleViewProgress,
            },
            {
              text: "View Notes",
              icon: <FaStickyNote className="text-purple-500" />,
              className: "bg-purple-100 hover:bg-purple-200",
              onClick: handleViewNotes,
            },
            {
              text: "Transfer Ticket",
              icon: (row) => (
                <div className="relative">
                  <FaExchangeAlt className="text-orange-500" />
                  {row.opTransferReq && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </div>
              ),
              className: "bg-orange-100 hover:bg-orange-200 relative",
              onClick: handleAssign,
            },
          ]}
        />
      )}
    </div>
  );
};

export default ManageOpTicketsPage;
