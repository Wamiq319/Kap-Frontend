import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { MdOutlineLockReset } from "react-icons/md";
import {
  createUser,
  getUsers,
  deleteUser,
  updatePassword,
} from "../../redux/authSlice";
import {
  DataTable,
  Button,
  InputField,
  ToastNotification,
  ConfirmationModal,
  Modal,
  Loader,
} from "../../components";

const AddGovEmployeePage = () => {
  const dispatch = useDispatch();
  const { users, data } = useSelector((state) => state.auth);
  console.log(data);
  const [formData, setFormData] = useState({
    entityId: data?.sector.id,
    name: "",
    mobile: "",
    username: "",
    password: "",
  });

  const [passwordEditData, setPasswordEditData] = useState({
    userId: null,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [uiState, setUiState] = useState({
    showToast: false,
    toastMessage: "",
    toastType: "success",
    errorMessage: "",
    isModalOpen: false,
    isLoading: true,
    isEditingPassword: false,
  });

  const [confirmDelete, setConfirmDelete] = useState({
    ids: [],
    isBulk: false,
    name: "",
  });

  const tableHeader = [
    { key: "index", label: "#" },
    { key: "name", label: "Employee Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ];

  const fetchUsers = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      const response = await dispatch(
        getUsers({
          resource: "employee",
          endpoint: "get-employees",
          queryParams: {
            role: "gov_employee",
            entityId: formData.entityId,
          },
        })
      );

      showToast(response.payload.message, "info");
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  const tableData = users?.map((item, index) => ({
    index: index + 1,
    id: item.id,
    name: item.name,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
  }));

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordEditData.newPassword !== passwordEditData.confirmPassword) {
      showToast("Passwords don't match", "error");
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      const response = await dispatch(
        updatePassword({
          userId: passwordEditData.userId,
          oldPassword: passwordEditData.oldPassword,
          newPassword: passwordEditData.newPassword,
        })
      ).unwrap();

      if (response.success) {
        showToast("Password updated successfully", "success");
        resetPasswordEdit();
        setUiState((prev) => ({ ...prev, isModalOpen: false }));
        fetchUsers();
      }
    } catch (error) {
      showToast(error.message || "Failed to update password", "error");
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleEditPassword = (user) => {
    setPasswordEditData({
      userId: user.id,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setUiState((prev) => ({
      ...prev,
      isModalOpen: true,
      isEditingPassword: true,
    }));
  };

  const handleDelete = (entity) => {
    setConfirmDelete({
      ids: [entity.id],
      isBulk: false,
      name: entity.name,
    });
  };

  const handleBulkDelete = (selectedIds) => {
    setConfirmDelete({
      ids: selectedIds,
      isBulk: true,
      name: "",
    });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.ids.length) return;

    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await Promise.all(
        confirmDelete.ids.map((id) =>
          dispatch(deleteUser({ userId: id, resource: "employee" }))
        )
      );

      const message = confirmDelete.isBulk
        ? `Deleted ${confirmDelete.ids.length} Employees`
        : `Deleted ${confirmDelete.name}`;

      showToast(message, "success");
      fetchUsers();
    } catch (error) {
      showToast(
        confirmDelete.isBulk ? "Bulk delete failed" : "Delete failed",
        "error"
      );
    } finally {
      setConfirmDelete({ ids: [], isBulk: false, name: "" });
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.mobile ||
      !formData.username ||
      !formData.password
    ) {
      setUiState((prev) => ({
        ...prev,
        errorMessage: "Please complete all fields.",
      }));
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      const response = await dispatch(
        createUser({
          resource: "employee",
          data: {
            ...formData,
            role: "gov_employee",
          },
        })
      ).unwrap();

      if (response?.success) {
        showToast(response.message, "success");
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        errorMessage: error.message || "Server error",
      }));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false, isModalOpen: false }));
    }
  };

  const showToast = (message, type) => {
    setUiState((prev) => ({
      ...prev,
      toastMessage: message,
      toastType: type,
      showToast: true,
    }));
  };

  const resetForm = () => {
    setFormData({
      entityId: data?.sector.id,
      name: "",
      mobile: "",
      username: "",
      password: "",
    });
  };

  const resetPasswordEdit = () => {
    setPasswordEditData({
      userId: null,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="p-4">
      <ConfirmationModal
        isOpen={confirmDelete.ids.length > 0}
        onClose={() => setConfirmDelete({ ids: [], isBulk: false, name: "" })}
        onConfirm={confirmDeleteAction}
        title={confirmDelete.isBulk ? "Confirm Bulk Delete" : "Confirm Delete"}
        message={
          confirmDelete.isBulk
            ? `Delete ${confirmDelete.ids.length} selected managers?`
            : `Delete ${confirmDelete.name}?`
        }
      />

      {uiState.showToast && (
        <ToastNotification
          message={uiState.toastMessage}
          type={uiState.toastType}
          onClose={() => setUiState((prev) => ({ ...prev, showToast: false }))}
        />
      )}

      <div className="flex justify-center">
        <Button
          text="Add Government Employee"
          onClick={() =>
            setUiState((prev) => ({
              ...prev,
              isModalOpen: true,
              isEditingPassword: false,
            }))
          }
          className="bg-green-600 hover:bg-green-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

      {uiState.isModalOpen && (
        <Modal
          isOpen={uiState.isModalOpen}
          onClose={() => {
            resetForm();
            resetPasswordEdit();
            setUiState((prev) => ({ ...prev, isModalOpen: false }));
          }}
          title={
            uiState.isEditingPassword ? "Reset Password" : "Add eentity Manager"
          }
        >
          <form
            onSubmit={
              uiState.isEditingPassword ? handlePasswordUpdate : handleSubmit
            }
            className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            {uiState.isEditingPassword ? (
              <>
                <InputField
                  label="Current Password"
                  name="oldPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordEditData.oldPassword}
                  onChange={(e) =>
                    setPasswordEditData((prev) => ({
                      ...prev,
                      oldPassword: e.target.value,
                    }))
                  }
                  required
                />
                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={passwordEditData.newPassword}
                  onChange={(e) =>
                    setPasswordEditData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                />
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordEditData.confirmPassword}
                  onChange={(e) =>
                    setPasswordEditData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
              </>
            ) : (
              <>
                <InputField
                  label="Full Name"
                  name="name"
                  placeholder="Enter Employee's full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <InputField
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                />
                <InputField
                  label="Username"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />

                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Set a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </>
            )}
            {uiState.errorMessage && (
              <p className="text-red-500 text-sm col-span-2">
                {uiState.errorMessage}
              </p>
            )}
            <div className="col-span-2 flex justify-end gap-2">
              <Button
                text="Cancel"
                onClick={() =>
                  setUiState((prev) => ({ ...prev, isModalOpen: false }))
                }
                className="bg-gray-500 hover:bg-gray-700"
              />
              <Button
                text="Create"
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={uiState.isLoading}
              />
            </div>
          </form>
        </Modal>
      )}

      {uiState.isLoading ? (
        <div className="flex justify-center align-middle">
          <Loader size={5} opacity={100} />
        </div>
      ) : (
        <DataTable
          heading="Government Employees"
          tableHeader={tableHeader}
          tableData={tableData}
          headerBgColor="bg-green-200"
          bulkActions={[
            {
              icon: <FaTrash className="text-red-500" />,
              className: "bg-red-100 hover:bg-red-200",
              onClick: handleBulkDelete,
            },
          ]}
          buttons={[
            {
              icon: <FaTrash className="text-red-500" />,
              className: "bg-red-100 hover:bg-red-200",
              onClick: handleDelete,
            },
            {
              icon: <MdOutlineLockReset className="text-red-500" />,
              className: "bg-blue-100 hover:bg-blue-200",
              onClick: handleEditPassword,
            },
          ]}
        />
      )}
    </div>
  );
};

export default AddGovEmployeePage;
