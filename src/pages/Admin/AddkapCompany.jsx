import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHome, FaTrash } from "react-icons/fa";
import {
  fetchEntities,
  addEntity,
  deleteEntity,
} from "../../redux/adminCrudSlice";
import {
  DataTable,
  Button,
  InputField,
  ImageInput,
  ToastNotification,
  ConfirmationModal,
  Modal,
  Loader,
} from "../../components";

const AddKapCompanyPage = () => {
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);

  const [formData, setFormData] = useState({
    governmentIntegration: "",
    logoImage: null,
    adminName: "",
    mobile: "",
    username: "",
    password: "",
  });

  const [uiState, setUiState] = useState({
    showToast: false,
    toastMessage: "",
    toastType: "success",
    errorMessage: "",
    isModalOpen: false,
    isLoading: true,
  });

  const [confirmDelete, setConfirmDelete] = useState({
    ids: [],
    isBulk: false,
    name: "",
  });

  const tableHeader = [
    { key: "index", label: "#" },
    { key: "governmentIntegration", label: "Government Integration" },
    { key: "image", label: "Logo" },
    { key: "adminName", label: "Admin Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ];

  const fetchData = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await dispatch(fetchEntities({ endpoint: "kap/companies" }));
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
    governmentIntegration: item.governmentIntegration,
    image: item.logoImage,
    adminName: item.adminName,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
  }));

  const handleDelete = (entity) => {
    setConfirmDelete({
      ids: [entity.id],
      isBulk: false,
      name: entity.adminName,
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
      const response = await Promise.all(
        confirmDelete.ids.map((id) =>
          dispatch(deleteEntity({ endpoint: "kap/delete", id }))
        )
      );

      const message = confirmDelete.isBulk
        ? `Deleted ${confirmDelete.ids.length} companies`
        : `Deleted ${confirmDelete.governmentIntegration}`;

      showToast(message, "success");
      fetchData();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      logoImage: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.governmentIntegration ||
      !formData.adminName ||
      !formData.mobile ||
      !formData.username ||
      !formData.password ||
      !formData.logoImage
    ) {
      setUiState((prev) => ({
        ...prev,
        errorMessage: "Please complete all fields",
      }));
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) formDataToSend.append(key, value);
      });

      const response = await dispatch(
        addEntity({ endpoint: "kap/create-company", formData: formDataToSend })
      ).unwrap();

      if (response.success) {
        showToast(response.message, "success");
        resetForm();
        fetchData();
      }
    } catch (error) {
      showToast(error.message || "Failed to add company", "error");
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
      governmentIntegration: "",
      logoImage: null,
      adminName: "",
      mobile: "",
      username: "",
      password: "",
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
            ? `Delete ${confirmDelete.ids.length} selected companies?`
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
          text="Add KAP Company"
          onClick={() => setUiState((prev) => ({ ...prev, isModalOpen: true }))}
          className="bg-gray-600 hover:bg-gray-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

      {uiState.isModalOpen && (
        <Modal
          isOpen={uiState.isModalOpen}
          onClose={() => {
            resetForm();
            setUiState((prev) => ({ ...prev, isModalOpen: false }));
          }}
          title="Add KAP Company"
        >
          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            <InputField
              label="Government Integration"
              name="governmentIntegration"
              placeholder="Enter integration details"
              value={formData.governmentIntegration}
              onChange={handleChange}
            />
            <ImageInput
              label="Logo Image"
              name="logoImage"
              onChange={handleImageChange}
            />
            <InputField
              label="Admin Name"
              name="adminName"
              placeholder="Enter admin full name"
              value={formData.adminName}
              onChange={handleChange}
            />
            <InputField
              label="Mobile Number"
              name="mobile"
              placeholder="Enter mobile number"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
            />
            <InputField
              label="Username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
            />
            <InputField
              label="Password"
              name="password"
              placeholder="Set a password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

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
                text="Save"
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
          heading="KAP Companies"
          tableHeader={tableHeader}
          tableData={tableData}
          headerBgColor="bg-gray-200"
          bulkActions={[
            {
              icon: <FaTrash />,
              className: "bg-red-500",
              onClick: handleBulkDelete,
            },
          ]}
          buttons={[
            {
              text: "Delete",
              icon: <FaTrash />,
              className: "bg-red-500",
              onClick: handleDelete,
            },
          ]}
        />
      )}
    </div>
  );
};

export default AddKapCompanyPage;
