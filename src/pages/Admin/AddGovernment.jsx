import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEntities,
  addEntity,
  updateEntity,
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
} from "../../components";
import { FaEdit, FaTrash } from "react-icons/fa";

const AddGovSectorPage = () => {
  const dispatch = useDispatch();
  const { entities, loading, error } = useSelector((state) => state.adminCrud);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    governmentSector: "",
    logoImage: null,
    adminName: "",
    mobile: "",
    username: "",
    password: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch entities on mount
  useEffect(() => {
    dispatch(fetchEntities({ endpoint: "kap/get-Companies" })); // Hardcoded endpoint
  }, [dispatch]);

  // Table Headers
  const tableHeader = [
    { key: "index", label: "#" },
    { key: "governmentSector", label: "Government Integration" },
    { key: "image", label: "Logo Image" },
    { key: "adminName", label: "Admin Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ];

  // Convert raw backend data to table format
  const tableData = entities?.length
    ? entities.map((item, index) => ({
        index: index + 1,
        id: item._id,
        governmentSector: item.governmentSector,
        image: item.logoImage,
        mobile: item.mobile,
        adminName: item.adminName,
        username: item.username,
        password: item.password,
      }))
    : [];

  // Handle Edit
  const handleEdit = (entity) => {
    setEditMode(true);
    setSelectedEntityId(entity.id);
    setFormData({
      governmentSector: entity.governmentSector,
      logoImage: null,
      adminName: entity.adminName,
      mobile: entity.mobile,
      username: entity.username,
      password: "",
    });
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = (entity) => {
    setConfirmDelete(entity);
  };

  // Confirm Delete
  const confirmDeleteAction = async () => {
    try {
      await dispatch(
        deleteEntity({ endpoint: "kap", id: confirmDelete.id }) // Pass full endpoint
      ).unwrap();
      setToast({ message: "Entity deleted successfully!", type: "success" });
      dispatch(fetchEntities({ endpoint: "kap/get-Companies" })); // Refresh Data
    } catch (error) {
      setToast({
        message: error || "Failed to delete entity.",
        type: "error",
      });
    }
    setConfirmDelete(null);
  };

  // Handle Bulk Delete
  const handleBulkDelete = async (selectedIds) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          dispatch(
            deleteEntity({ endpoint: "kap", id }) // Hardcoded endpoint
          ).unwrap()
        )
      );
      setToast({
        message: "Selected entities deleted successfully!",
        type: "success",
      });
      dispatch(fetchEntities({ endpoint: "kap/get-Companies" })); // Refresh Data
    } catch (error) {
      setToast({
        message: error || "Failed to delete selected entities.",
        type: "error",
      });
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, logoImage: e.target.files[0] });
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.governmentSector ||
      !formData.adminName ||
      !formData.mobile ||
      !formData.username ||
      (!editMode && !formData.password)
    ) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    setErrorMessage("");

    const formDataToSend = new FormData();
    formDataToSend.append("governmentSector", formData.governmentSector);
    formDataToSend.append("adminName", formData.adminName);
    formDataToSend.append("mobile", formData.mobile);
    formDataToSend.append("username", formData.username);
    if (!editMode) formDataToSend.append("password", formData.password);

    try {
      if (editMode) {
        const updatedData = {};
        const selectedEntity = entities.find((e) => e._id === selectedEntityId);

        if (!selectedEntity) {
          setToast({ message: "Error: Entity not found.", type: "error" });
          return;
        }

        Object.keys(formData).forEach((key) => {
          if (formData[key] !== selectedEntity[key]) {
            updatedData[key] = formData[key];
          }
        });

        if (Object.keys(updatedData).length === 0) {
          setToast({ message: "No changes detected", type: "info" });
          return;
        }

        var editFormDataToSend = new FormData();
        Object.entries(updatedData).forEach(([key, value]) => {
          editFormDataToSend.append(key, value);
        });

        await dispatch(
          updateEntity({
            endpoint: "kap",
            id: selectedEntityId,
            formData: editFormDataToSend,
          })
        ).unwrap();
        setToast({ message: "Entity updated successfully!", type: "success" });
      } else {
        await dispatch(
          addEntity({
            endpoint: "kap/create-Company",
            formData: formDataToSend,
          }) // Hardcoded endpoint
        ).unwrap();
        setToast({ message: "Entity added successfully!", type: "success" });
      }
      dispatch(fetchEntities({ endpoint: "kap/get-Companies" })); // Refresh Data
    } catch (error) {
      console.error("API Error:", error);
      setToast({ message: error || "Unable to connect", type: "error" });
    }

    setIsModalOpen(false);
    setEditMode(false);
    setFormData({
      governmentSector: "",
      logoImage: null,
      adminName: "",
      mobile: "",
      username: "",
      password: "",
    });
  };

  return (
    <div className="p-4">
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteAction}
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${confirmDelete.adminName}?`}
        />
      )}

      <div className="flex justify-center">
        <Button
          text="Add Government Sector"
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setEditMode(false);
            setFormData("");
            setIsModalOpen(false);
          }}
          title={editMode ? "Edit Entity" : "Add Entity"}
        >
          <form
            onSubmit={handleSubmit}
            className=" md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            <InputField
              label="Government Sector"
              name="governmentSector"
              placeholder="Enter Sector details"
              value={formData.governmentSector}
              onChange={handleChange}
            />
            <ImageInput
              label="Logo Image"
              name="logoImage"
              onChange={handleImageChange}
            />
            <InputField
              label="Administration Name"
              name="adminName"
              placeholder="Enter admin name"
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
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
            />

            <InputField
              label="Password"
              name="password"
              placeholder="Enter password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            {errorMessage && (
              <p className="text-red-500 text-sm col-span-2">{errorMessage}</p>
            )}
            <div className="col-span-2 flex justify-end gap-2">
              <Button
                text="Cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditMode(false);
                  setFormData("");
                }}
                className="bg-gray-500 hover:bg-gray-700"
              />
              <Button
                text="Save"
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              />
            </div>
          </form>
        </Modal>
      )}

      <DataTable
        heading="Government Sectors"
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
            text: "Delete",
            icon: <FaTrash />,
            className: "bg-red-500",
            onClick: handleDelete,
          },
        ]}
      />
    </div>
  );
};

export default AddGovSectorPage;
