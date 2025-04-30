import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome, FaTrash } from "react-icons/fa";
import { MdOutlineLockReset } from "react-icons/md";
import {
  createUser,
  getUsers,
  deleteUser,
  updatePassword,
} from "../../redux/slices/authSlice";
import { fetchNames } from "../../redux/slices/adminCrudSlice";
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

const AddCompanyManagerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { names } = useSelector((state) => state.adminCrud);
  const { users } = useSelector((state) => state.auth);
const words = useSelector((state) => state.lang.words);

  const [formData, setFormData] = useState({
    companyId: "",
    name: "",
    mobile: "=966",
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
    { key: "index", label: words["#"] },
    { key: "name", label: words["Manager Name"] },
    { key: "company", label: words["Company"] },
    { key: "username", label: words["Username"] },
    { key: "password", label: words["Password"] },
    { key: "mobile", label: words["Mobile No"] },
  ];

  const fetchUsers = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await dispatch(fetchNames({ endpoint: "op/company-names" }));
      await dispatch(getUsers({ endpoint: "op-managers" }));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  const options = names?.map((name) => ({
    value: name.id,
    label: name.companyName,
  }));

  const tableData = users?.map((item, index) => ({
    index: index + 1,
    id: item.id,
    name: item.name,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
    company: item.company,
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
        })
      ).unwrap();

      if (response.success) {
        showToast("Password updated successfully", "success");
        resetPasswordEdit();
        setUiState((prev) => ({ ...prev, isModalOpen: false }));
        fetchUsers();
      }
      fetchUsers();
    } catch (error) {
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
        confirmDelete.ids.map((id) => dispatch(deleteUser({ userId: id })))
      );

      const message = confirmDelete.isBulk
        ? `Deleted ${confirmDelete.ids.length} managers`
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
      !formData.companyId
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
          data: {
            ...formData,
            role: "op_manager",
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
      companyId: "",
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
      <button
        onClick={() => navigate("/manage-employees")}
        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md"
      >
        <FaHome
          size={24}
          className="text-blue-500 hover:text-blue-700 transition"
        />
      </button>

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
          text={words["Add Company Manager"]}
          onClick={() =>
            setUiState((prev) => ({
              ...prev,
              isModalOpen: true,
              isEditingPassword: false,
            }))
          }
          className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold py-3 mb-2 shadow"
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
            uiState.isEditingPassword ? words["Reset Password"] : words["Add Company Manager"]
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
                  label={words["Current Password"]}
                  name="oldPassword"
                  type="password"
                  placeholder={words["Enter current password"]}
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
                   label={words["New Password"]}
                  name="newPassword"
                  type="password"
                  placeholder={words["Enter new password (min 8 characters)"]}
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
                   label={words["Confirm Password"]}
                  name="confirmPassword"
                  type="password"
                  placeholder={words["Confirm new password"]}
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
                  label={words["Full Name"]}
                  name="name"
                  placeholder={words["Enter employee's full name"]}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <InputField
                   label={words["Username"]}
                  name="username"
                  placeholder={words["Choose a username"]}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
                <InputField
                   label={words["Mobile Number"]}
                  name="mobile"
                  type="tel"
                  placeholder="+9665XXXXXXXX"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                />
                <Dropdown
                  label={words["Company"]}
                  options={options}
                  selectedValue={formData.companyId}
                  placeholder={words["Select company"]}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, companyId: value }))
                  }
                />
                <InputField
                  label={words["Password"]}
                  name="password"
                  type="password"
                  placeholder={words["Set a password"]}
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
                text={words["Cancel"]}
                onClick={() =>
                  setUiState((prev) => ({ ...prev, isModalOpen: false }))
                }
                 className="bg-gray-500 hover:bg-gray-700 text-white"
              />
              <Button
                 text={
                  uiState.isLoading
                    ? uiState.isEditingPassword
                      ? words["Updating..."]
                      : words["Creating..."]
                    : uiState.isEditingPassword
                    ? words["Update"]
                    : words["Create"]
                }
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
          heading={words["Company Managers"]}
          tableHeader={tableHeader}
          tableData={tableData}
          headerBgColor="bg-blue-200"
          rowsPerPage={5}
          bulkActions={[
            {
              text: words["Remove Selected"],
              icon: <FaTrash />,
              className: "bg-red-500  hover:bg-red-600 text-white",
              onClick: handleBulkDelete,
            },
          ]}
          buttons={[
            {
              text: words["Remove"],
              icon: <FaTrash />,
              className: "bg-red-500 hover:bg-red-600 text-white",
              onClick: handleDelete,
            },
            {
              text: words["Reset Password"],
              icon: <MdOutlineLockReset />,
              className: "bg-blue-500 hover:bg-blue-600 text-white",
              onClick: handleEditPassword,
            },
          ]}
        />
      )}
    </div>
  );
};

export default AddCompanyManagerPage;
