import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKapCompanies,
  addKapCompany,
  updateKapCompany,
  deleteKapCompany,
} from "../../redux/kapSlice";

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

const AddKapPage = () => {
  const dispatch = useDispatch();
  const { kapCompanies, loading, error } = useSelector((state) => state.kap);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    governmentIntegration: "",
    logoImage: null,
    adminName: "",
    mobile: "",
    username: "",
    password: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch companies on mount
  useEffect(() => {
    dispatch(fetchKapCompanies());
  }, [dispatch]);

  // Table Headers
  const tableHeader = [
    { key: "index", label: "#" },
    { key: "governmentIntegration", label: "Government Integration" },
    { key: "image", label: "Logo Image" },
    { key: "adminName", label: "Admin Name" },
    { key: "mobile", label: "Mobile No" },

    { key: "username", label: "Username" },
    { key: "password", label: "password" },
  ];

  // Convert raw backend data to table format
  const tableData = kapCompanies.map((item, index) => ({
    index: index + 1,
    id: item._id,
    governmentIntegration: item.governmentIntegration,
    image: item.logoImage, // Assuming logoImage is the URL
    mobile: item.mobile,
    adminName: item.adminName,
    username: item.username,
    password: item.password,
  }));

  // Handle Edit
  const handleEdit = (company) => {
    setEditMode(true);
    setSelectedCompanyId(company.id);
    setFormData({
      governmentIntegration: company.governmentIntegration,
      logoImage: null,
      adminName: company.adminName,
      mobile: company.mobile,
      username: company.username,
      password: "",
    });

    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = (company) => {
    setConfirmDelete(company);
  };

  // Confirm Delete
  const confirmDeleteAction = async () => {
    try {
      await dispatch(deleteKapCompany(confirmDelete.id)).unwrap();
      setToast({ message: "Company deleted successfully!", type: "success" });
      dispatch(fetchKapCompanies()); // Refresh Data
    } catch (error) {
      setToast({
        message: error || "Failed to delete company.",
        type: "error",
      });
    }
    setConfirmDelete(null);
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
      !formData.governmentIntegration ||
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
    formDataToSend.append(
      "governmentIntegration",
      formData.governmentIntegration
    );
    formDataToSend.append("adminName", formData.adminName);
    formDataToSend.append("mobile", formData.mobile);
    formDataToSend.append("username", formData.username);
    if (!editMode) formDataToSend.append("password", formData.password);

    try {
      if (editMode) {
        const updatedData = {};
        const selectedCompany = kapCompanies.find(
          (c) => c._id === selectedCompanyId
        );

        if (!selectedCompany) {
          setToast({ message: "Error: Company not found.", type: "error" });
          return;
        }

        Object.keys(formData).forEach((key) => {
          if (formData[key] !== selectedCompany[key]) {
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
          updateKapCompany({
            id: selectedCompanyId,
            formData: editFormDataToSend,
          })
        ).unwrap();
        setToast({ message: "Company updated successfully!", type: "success" });
      } else {
        await dispatch(addKapCompany(formDataToSend)).unwrap();
        setToast({ message: "Company added successfully!", type: "success" });
      }
      dispatch(fetchKapCompanies()); // Refresh Data
    } catch (error) {
      console.error("API Error:", error);
      setToast({ message: error || "Unable to connect", type: "error" });
    }

    setIsModalOpen(false);
    setEditMode(false);
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
          text="Add KAP Company"
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-600 hover:bg-gray-700 text-lg font-semibold py-3 mb-2 shadow"
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
          title={editMode ? "Edit KAP Company" : "Add KAP Company"}
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
        heading="KAP COMPANIES"
        tableHeader={tableHeader}
        tableData={tableData}
        buttons={[
          {
            text: "Edit",
            icon: <FaEdit />,
            className: "bg-blue-500",
            onClick: handleEdit,
          },
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

export default AddKapPage;
