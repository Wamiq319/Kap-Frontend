import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "../../components";
import { FaTrash } from "react-icons/fa";

const AddGovSectorPage = () => {
  // Redux and State Management
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    govSector: "",
    logoImage: null,
    adminName: "",
    mobile: "",
    username: "",
    password: "",
  });

  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch entities on component mount
  useEffect(() => {
    dispatch(fetchEntities({ endpoint: "gov/sectors" }));
  }, [dispatch]);

  // Table Configuration
  const tableHeader = [
    { key: "index", label: "#" },
    { key: "govSector", label: "Government Sectors" },
    { key: "image", label: "Logo Image" },
    { key: "adminName", label: "Admin Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ];

  const tableData = entities?.map((item, index) => ({
    index: index + 1,
    id: item._id,
    govSector: item.govSector,
    image: item.logoImage,
    mobile: item.mobile,
    adminName: item.adminName,
    username: item.username,
    password: item.password,
  }));

  // Event Handlers
  const handleDelete = (entity) => {
    setConfirmDelete(entity);
  };

  const confirmDeleteAction = async () => {
    try {
      await dispatch(
        deleteEntity({ endpoint: "kap", id: confirmDelete.id })
      ).unwrap();
      setToast({ message: "Entity deleted successfully!", type: "success" });
      dispatch(fetchEntities({ endpoint: "kap/get-Companies" }));
    } catch (error) {
      setToast({ message: error || "Failed to delete entity.", type: "error" });
    }
    setConfirmDelete(null);
  };

  const handleBulkDelete = async (selectedIds) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          dispatch(deleteEntity({ endpoint: "kap", id })).unwrap()
        )
      );
      setToast({
        message: "Selected entities deleted successfully!",
        type: "success",
      });
      dispatch(fetchEntities({ endpoint: "kap/get-Companies" }));
    } catch (error) {
      setToast({
        message: error || "Failed to delete selected entities.",
        type: "error",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, logoImage: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.govSector ||
      !formData.adminName ||
      !formData.mobile ||
      !formData.username ||
      !formData.password
    ) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    setErrorMessage("");

    const formDataToSend = new FormData();
    formDataToSend.append("govSector", formData.govSector);
    formDataToSend.append("adminName", formData.adminName);
    formDataToSend.append("mobile", formData.mobile);
    formDataToSend.append("username", formData.username);
    formDataToSend.append("password", formData.password);

    try {
      const result = await dispatch(
        addEntity({ endpoint: "gov/create-sector", formData: formDataToSend })
      ).unwrap();

      if (result.success) {
        setToast({ message: "Company added successfully!", type: "success" });
      } else {
        setToast({ message: result.message, type: "error" });
      }
      dispatch(fetchEntities({ endpoint: "op/companies" }));
    } catch (error) {
      setToast({ message: error || "Unable to connect", type: "error" });
    }

    setIsModalOpen(false);
    setFormData({
      governmentSector: "",
      logoImage: null,
      adminName: "",
      mobile: "",
      username: "",
      password: "",
    });
  };

  // Render
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
            setFormData({
              governmentSector: "",
              logoImage: null,
              adminName: "",
              mobile: "",
              username: "",
              password: "",
            });
            setIsModalOpen(false);
          }}
          title="Add Government Sector"
        >
          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            <InputField
              label="Government Sector"
              name="govSector"
              placeholder="Enter Sector details"
              value={formData.govSector}
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
                  setFormData({
                    governmentSector: "",
                    logoImage: null,
                    adminName: "",
                    mobile: "",
                    username: "",
                    password: "",
                  });
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
