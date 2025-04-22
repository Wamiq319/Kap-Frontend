import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { MdOutlineLockReset } from "react-icons/md";
import {
  createUser,
  getUsers,
  deleteUser,
  updatePassword,
} from "../../redux/slices/authSlice";
import {
  DataTable,
  Button,
  InputField,
  Dropdown,
  ConfirmationModal,
  Modal,
  Loader,
  ToastNotification,
} from "../../components";

const AddKapEmployeePage = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.auth);
  const words = useSelector((state) => state.lang.words);
 
  const [formData, setFormData] = useState({
    name: "",
    mobile: "+966",
    username: "",
    jobTitle: "",
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
    isLoading: false,
    isEditingPassword: false,
  });

  const [confirmDelete, setConfirmDelete] = useState({
    ids: [],
    isBulk: false,
    name: "",
  });

  const jobTitleOptions = [
    { value: "Affair-officer", label: words["Affair Officer"] },
    { value: "Data-Entry", label: words["Data Entry"] },
    { value: "Ticket-Supervisor", label: words["Ticket Supervisor"] },
  ];

  const tableHeader = [
    { key: "index", label: words["#"] },
    { key: "name", label: words["Employee Name"] },
    { key: "jobTitle", label: words["Job Title"] },
    { key: "mobile", label: words["Mobile No"] },
    { key: "username", label: words["Username"] },
    { key: "password", label: words["Password"] },
  ];

  const fetchUsers = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await dispatch(getUsers("kap-employees"));
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  const tableData = users?.map((item, index) => ({
    index: index + 1,
    id: item._id,
    name: item.name,
    jobTitle: item.jobTitle,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
  }));

  const showToast = (message, type) => {
    setUiState((prev) => ({
      ...prev,
      showToast: true,
      toastMessage: message,
      toastType: type,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "+966",
      username: "",
      jobTitle: "",
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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setUiState((prev) => ({
      ...prev,
      errorMessage: null,
    }));
    if (
      !passwordEditData.newPassword ||
      !passwordEditData.confirmPassword ||
      !passwordEditData.oldPassword
    ) {
      setUiState((prev) => ({
        ...prev,
        errorMessage: words["Please complete all fields"],
      }));
      return;
    }
    if (passwordEditData.newPassword !== passwordEditData.confirmPassword) {
      showToast(words["Passwords don't match"], "error");
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
        showToast(response.message, "success");
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast(words["Failed to update password"], "error");
    } finally {
      resetPasswordEdit();
      setUiState((prev) => ({ ...prev, isModalOpen: false, isLoading: false }));
      await fetchUsers();
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
    if (selectedIds.length === 0) {
      showToast(words["No employees selected"], "warning");
      return;
    }
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
        ? `${words["Deleted"]} ${confirmDelete.ids.length} ${words["employees"]}`
        : `${words["Deleted Successfully"]}`;

      showToast(message, "success");
      await fetchUsers();
    } catch (error) {
      showToast(
        confirmDelete.isBulk
          ? words["Bulk delete failed"]
          : words["Delete failed"],
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
      !formData.jobTitle
    ) {
      setUiState((prev) => ({
        ...prev,
        errorMessage: words["Please complete all fields"],
      }));
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      const response = await dispatch(
        createUser({
          data: {
            ...formData,
            role: "kap_employee",
          },
        })
      ).unwrap();

      if (response?.success) {
        showToast(
          response.message || words["Employee created successfully"],
          "success"
        );
        resetForm();
        await fetchUsers();
      } else {
        showToast(
          response.message || words["Failed to create employee"],
          "error"
        );
      }
    } catch (error) {
      showToast(error.message || words["Server error"], "error");
    } finally {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
        isModalOpen: false,
        errorMessage: "",
      }));
      resetForm();
      await fetchUsers();
    }
  };

  return (
    <div className="p-4">
      <ConfirmationModal
        isOpen={confirmDelete.ids.length > 0}
        onClose={() => setConfirmDelete({ ids: [], isBulk: false, name: "" })}
        onConfirm={confirmDeleteAction}
        title={
          confirmDelete.isBulk
            ? words["Confirm Bulk Delete"]
            : words["Confirm Delete"]
        }
        message={
          confirmDelete.isBulk
            ? `${words["Delete"]} ${confirmDelete.ids.length} ${words["selected employees?"]}`
            : `${words["Delete"]} ${confirmDelete.name}?`
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
          text={words["Add KAP Employee"]}
          onClick={() =>
            setUiState((prev) => ({
              ...prev,
              isModalOpen: true,
              isEditingPassword: false,
            }))
          }
          className="bg-slate-600 hover:bg-slate-700 text-white text-lg font-semibold py-3 mb-2 shadow"
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
              ? words["Reset Password"]
              : words["Add KAP Employee"]
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
                  label={words["Mobile Number"]}
                  name="mobile"
                  type="tel"
                  placeholder="+9665XXXXXXXX"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mobile: e.target.value }))
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
                <Dropdown
                  label={words["Job Title"]}
                  options={jobTitleOptions}
                  selectedValue={formData.jobTitle}
                  placeholder={words["Select job title"]}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, jobTitle: value }))
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
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={uiState.isLoading}
              />
            </div>
          </form>
        </Modal>
      )}

      {uiState.isLoading ? (
        <div className="flex border-blue-400 justify-center align-middle">
          <Loader size={5} opacity={100} />
        </div>
      ) : (
        <DataTable
          heading={words["KAP Employees"]}
          tableHeader={tableHeader}
          tableData={tableData}
          headerBgColor="bg-slate-200"
          borderColor="border-slate-200"
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
              icon: <FaTrash className="text-white" />,
              className: "bg-red-500 hover:bg-red-600 text-white",
              onClick: handleDelete,
            },
            {
              text: words["Reset Password"],
              icon: <MdOutlineLockReset className="text-white" />,
              className: "bg-blue-500 hover:bg-blue-600 text-white",
              onClick: handleEditPassword,
            },
          ]}
        />
      )}
    </div>
  );
};

export default AddKapEmployeePage;
