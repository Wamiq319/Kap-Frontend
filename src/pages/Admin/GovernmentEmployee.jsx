import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome, FaEdit, FaTrash } from "react-icons/fa";
import {
  createUser,
  getUsers,
  deleteUser,
  updatePassword,
} from "../../redux/authSlice";
import { fetchNames } from "../../redux/adminCrudSlice";
import {
  DataTable,
  Button,
  InputField,
  Dropdown,
  ToastNotification,
  ConfirmationModal,
  Modal,
  Loader,
} from "../../components";

const AddGovernmentEmployeePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { names } = useSelector((state) => state.adminCrud);
  const { users } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    entityId: "",
    name: "",
    mobile: "+966",
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
    { key: "image", label: "Sector" },
    { key: "sector", label: "Gov Sector" },
    { key: "name", label: "Employee Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ];

  const fetchUsers = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await dispatch(fetchNames({ endpoint: "gov/sector-names" }));
      const response = await dispatch(
        getUsers({
          resource: "employee",
          endpoint: "get-employees",
          queryParams: {
            role: "gov_employee",
            entityId: "Get_All",
          },
        })
      );

      showToast(response.payload.message, "info");
    } finally {
      console.log(users);
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  const options = names?.map((name) => ({
    value: name.id,
    label: name.sectorName,
  }));

  const tableData = users?.map((item, index) => ({
    index: index + 1,
    id: item.id,
    name: item.name,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
    image: item.entityImage,
    sector: item.entityName,
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
          id: passwordEditData.userId,
          data: {
            oldPassword: passwordEditData.oldPassword,
            newPassword: passwordEditData.newPassword,
          },
          resource: "employee",
        })
      ).unwrap();

      if (response.success) {
        showToast("Password updated successfully", "success");
        resetPasswordEdit();
        setUiState((prev) => ({ ...prev, isModalOpen: false }));
      }
      fetchUsers();
    } catch (error) {
      conseol.error(error);
      showToast(error.message || "Failed to update password", "error");
    } finally {
      resetPasswordEdit();
      setUiState((prev) => ({
        ...prev,
        isModalOpen: false,
        isEditingPassword: false,
        isLoading: false,
      }));
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
        ? `Deleted ${confirmDelete.ids.length} users`
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
      !formData.password ||
      !formData.entityId
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
      } else {
        showToast(response.message, "error");
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
      entityId: "",
      name: "",
      mobile: "+966",
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
      <button onClick={() => navigate("/manage-employees")} className="ml-4">
        <FaHome
          size={24}
          className="text-green-500 hover:text-green-700 transition"
        />
      </button>

      <ConfirmationModal
        isOpen={confirmDelete.ids.length > 0}
        onClose={() => setConfirmDelete({ ids: [], isBulk: false, name: "" })}
        onConfirm={confirmDeleteAction}
        title={confirmDelete.isBulk ? "Confirm Bulk Delete" : "Confirm Delete"}
        message={
          confirmDelete.isBulk
            ? `Delete ${confirmDelete.ids.length} selected users?`
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
            uiState.isEditingPassword
              ? "Reset Password"
              : "Add Government Employee"
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
                  placeholder="Enter Old Password"
                  type="password"
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
                  placeholder="Enter new password"
                  type="password"
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
                  placeholder="Confirm new Password"
                  type="password"
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
                  label="Name"
                  name="name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <InputField
                  label="Mobile"
                  name="mobile"
                  placeholder="+9665XXXXXXXX"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                />
                <InputField
                  label="Username"
                  name="username"
                  placeholder="Enter UserName"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
                <Dropdown
                  label="Sector"
                  options={options}
                  selectedValue={formData.entityId}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, entityId: value }))
                  }
                />
                <InputField
                  label="Password"
                  name="password"
                  placeholder="Enter Password"
                  type="password"
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
                text={uiState.isLoading ? "Saving...." : "Save"}
                type="submit"
                className="bg-green-600 hover:bg-green-700"
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
          heading="Gov Employees"
          tableHeader={tableHeader}
          tableData={tableData}
          headerBgColor="bg-green-200"
          bulkActions={[
            {
              icon: <FaTrash />,
              className: "bg-red-500",
              onClick: handleBulkDelete,
            },
          ]}
          buttons={[
            {
              text: "Remove",
              icon: <FaTrash />,
              className: "bg-red-500",
              onClick: handleDelete,
            },
            {
              text: "Reset Password",
              icon: <FaEdit />,
              className: "bg-blue-500",
              onClick: handleEditPassword,
            },
          ]}
        />
      )}
    </div>
  );
};

export default AddGovernmentEmployeePage;
