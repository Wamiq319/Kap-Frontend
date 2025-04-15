import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaExchangeAlt } from "react-icons/fa";
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
} from "../../components";

const ManageTicketsGovPage = () => {
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
    },
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
    { key: "operator", label: "Operator" },
    { key: "expectedCompletionDate", label: "Expected Completion" },
    { key: "status", label: "Ticket Status" },
  ];

  const fetchData = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await dispatch(
        fetchEntities({
          endpoint: "tkt/tickets",
          params: {
            userRole: "gov_manager",
            userId: user.sector?.id ?? null,
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
            role: "gov_employee",
            entityId: user.sector?.id,
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

  const formatTableData = () => {
    return entities?.map((item, index) => ({
      index: index + 1,
      id: item._id,
      requestType: item.requestType,
      ticketNumber: item.ticketNumber,
      location: item.location,
      operator: item.operator,
      expectedCompletionDate: item.expectedCompletionDate
        ? new Date(item.expectedCompletionDate).toLocaleDateString()
        : "",
      status: item.status,
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

  const handleAssign = (ticket) => {
    const fullTicket = entities.find((e) => e._id === ticket.id);

    setModals((prev) => ({
      ...prev,
      assign: {
        isOpen: true,
        ticketId: ticket.id,
        employeeId: fullTicket?.assignedTo?._id || "",
        currentAssignee: fullTicket?.assignedTo || null,
      },
    }));
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
          setModals((prev) => ({
            ...prev,
            assign: {
              ...prev.assign,
              isOpen: false,
            },
          }));
          setUiState((prev) => ({ ...prev, isLoading: true }));
          const response = await dispatch(
            updateEntity({
              endpoint: "tkt/assign",
              id: modals.assign.ticketId,
              data: {
                assignedToId: modals.assign.employeeId,
                assigneeType: "govEmployee",
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
            },
          }))
        }
        title="Assign Ticket"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 ">
          {modals.assign.currentAssignee && (
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <h3 className="font-semibold">
                Currently Assigned: {modals.assign.currentAssignee}
              </h3>
            </div>
          )}

          <Dropdown
            label={modals.assign.currentAssignee ? "Reassign to" : "Assign to"}
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
                  },
                }))
              }
              className="bg-gray-500 hover:bg-gray-700"
            />
            <Button
              text={uiState.isLoading ? "Processing..." : "Confirm Assignment"}
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={uiState.isLoading}
            />
          </div>
        </form>
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
          heading="Tickets Assigned to your Sector"
          tableHeader={tableHeaders}
          tableData={formatTableData()}
          headerBgColor="bg-green-200"
          rowHoverEffect={true}
          buttons={[
            {
              text: "Transfer Ticket",
              icon: <FaExchangeAlt className="text-orange-500" />,
              className: "bg-orange-100 hover:bg-orange-200",
              onClick: handleAssign,
            },
          ]}
        />
      )}
    </div>
  );
};

export default ManageTicketsGovPage;
