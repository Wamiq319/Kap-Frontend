import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaEye } from "react-icons/fa";
import { fetchEntities, updateEntity } from "../../redux/adminCrudSlice";
import { getUsers } from "../../redux/authSlice";
import {
  DataTable,
  Button,
  ToastNotification,
  Modal,
  Loader,
  InputField,
  ConfirmationModal,
} from "../../components";

const ManageTicketsEmployeePage = () => {
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);
  const user = JSON.parse(localStorage.getItem("user"));

  const [uiState, setUiState] = useState({
    showToast: false,
    toastMessage: "",
    toastType: "success",
    isLoading: false,
  });

  const [modals, setModals] = useState({
    followUp: { isOpen: false, ticket: null, percentage: 0, observation: "" },
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
  ];

  // Progress history table headers
  const progressHeaders = [
    { key: "index", label: "#" },
    { key: "percentage", label: "Progress" },
    { key: "date", label: "Date" },
    { key: "observation", label: "Notes" },
  ];

  // Dummy progress data for testing
  const dummyProgressData = [
    {
      percentage: 100,
      observation: "Task completed successfully",
      date: new Date("2023-05-15T10:30:00Z"),
    },
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

  useEffect(() => {
    fetchData();
  }, [dispatch]);

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
    }));
  };

  const formatProgressData = (progress) => {
    if (!progress || !Array.isArray(progress)) return [];

    return progress
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((item, index) => ({
        index: index + 1,
        percentage: `${item.percentage}%`,
        date: new Date(item.date).toLocaleDateString(),
        observation: item.observation || "-",
      }));
  };

  const handleFollowUp = (tableRow) => {
    const ticket = entities.find((entity) => entity._id === tableRow.id);

    if (!ticket) {
      showToast("Ticket data not found", "error");
      return;
    }
    setModals((prev) => ({
      ...prev,
      followUp: {
        isOpen: true,
        ticket,
      },
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

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    showConfirmation(
      "Are you sure you want to add this progress update?",
      async () => {
        try {
          setUiState((prev) => ({ ...prev, isLoading: true }));

          const formData = new FormData();
          formData.append("percentage", modals.followUp.percentage);
          const response = await dispatch(
            updateEntity({
              endpoint: "tkt/progress",
              id: modals.followUp.ticket._id,
              data: {
                percentage: modals.followUp.percentage,
                observation: modals.followUp.observation,
              },
            })
          ).unwrap();
          if (response.success) {
            showToast("Progress updated successfully", "success");
            fetchData();
            setModals((prev) => ({
              ...prev,
              followUp: {
                ...prev.followUp,
                isOpen: false,
                percentage: 0,
                observation: "",
              },
            }));
          }
        } catch (error) {
          showToast(error.message || "Failed to update progress", "error");
        } finally {
          setUiState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    );
  };

  const handleMarkComplete = async () => {
    showConfirmation(
      "Are you sure you want to mark this ticket as complete?",
      async () => {
        try {
          setUiState((prev) => ({ ...prev, isLoading: true }));

          await dispatch(
            updateEntity({
              endpoint: "tkt/status",
              id: modals.followUp.ticket._id,
              data: { status: "Completed" },
            })
          ).unwrap();

          showToast("Ticket marked as complete", "success");
          fetchData();
          setModals((prev) => ({
            ...prev,
            followUp: {
              ...prev.followUp,
              isOpen: false,
              percentage: 0,
              observation: "",
            },
          }));
        } catch (error) {
          showToast(error.message || "Failed to mark as complete", "error");
        } finally {
          setUiState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    );
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
              id: modals.followUp.ticket._id,
              data: { status: "In Progress" },
            })
          ).unwrap();

          if (response.success) {
            showToast("Ticket accepted successfully", "success");
            fetchData();
            setModals((prev) => ({
              ...prev,
              followUp: { isOpen: false, ticket: null },
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

  const showToast = (message, type) => {
    setUiState((prev) => ({
      ...prev,
      toastMessage: message,
      toastType: type,
      showToast: true,
    }));
  };

  return (
    <div className="p-4">
      {/* Follow Up Modal */}
      <Modal
        isOpen={modals.followUp.isOpen}
        onClose={() =>
          setModals((prev) => ({
            ...prev,
            followUp: { ...prev.followUp, isOpen: false },
          }))
        }
        title="Ticket Details"
      >
        {modals.followUp.ticket && (
          <div className="">
            {modals.followUp.ticket.status === "Open" ? (
              <div className="text-center p-4">
                <Button
                  text="Accept Ticket"
                  onClick={handleAcceptTicket}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2"
                  disabled={uiState.isLoading}
                />
              </div>
            ) : modals.followUp.ticket.status === "Completed" ? (
              <div className="text-center p-4">
                <h3 className="font-semibold mb-3">Ticket Completed</h3>
                <p className="text-sm text-gray-600">
                  The ticket has been completed and is waiting for closure.
                </p>
                <div className="mt-4">
                  <DataTable
                    tableHeader={progressHeaders}
                    tableData={formatProgressData(dummyProgressData)}
                    emptyMessage="No progress history available"
                    className="shadow-sm"
                    headerBgColor="bg-gray-100"
                    rowsPerPage={3}
                  />
                </div>
              </div>
            ) : (
              <div>
                <form
                  onSubmit={handleProgressSubmit}
                  className="bg-gray-50 p-1 rounded-lg"
                >
                  <h3 className="font-semibold mb-3">Update Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Percentage"
                      name="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={modals.followUp.percentage}
                      onChange={(e) =>
                        setModals((prev) => ({
                          ...prev,
                          followUp: {
                            ...prev.followUp,
                            percentage: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                    <InputField
                      label="Observation"
                      name="observation"
                      type="textarea"
                      rows={2}
                      value={modals.followUp.observation}
                      onChange={(e) =>
                        setModals((prev) => ({
                          ...prev,
                          followUp: {
                            ...prev.followUp,
                            observation: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="flex justify-between px-8">
                    <Button
                      onClick={handleMarkComplete}
                      text={
                        uiState.isLoading ? "Processing..." : "Mark As Complete"
                      }
                      className="bg-red-600 hover:bg-red-700 px-6 py-2"
                      disabled={uiState.isLoading}
                    />
                    <Button
                      type="submit"
                      text={uiState.isLoading ? "Adding..." : "Add Progress"}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={uiState.isLoading}
                    />
                  </div>
                </form>

                <div>
                  <DataTable
                    heading={"Progress History"}
                    tableHeader={progressHeaders}
                    tableData={formatProgressData(dummyProgressData)}
                    emptyMessage="No progress history available"
                    className="shadow-sm"
                    headerBgColor="bg-gray-100"
                    rowsPerPage={3}
                  />
                </div>
              </div>
            )}
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
          heading="Tickets"
          tableHeader={tableHeaders}
          tableData={formatTableData()}
          headerBgColor="bg-gray-200"
          rowHoverEffect={true}
          buttons={[
            {
              text: "Follow Up",
              icon: <FaEye className="text-blue-500" />,
              className: "bg-blue-100 hover:bg-blue-200",
              onClick: handleFollowUp,
            },
          ]}
        />
      )}
    </div>
  );
};

export default ManageTicketsEmployeePage;
