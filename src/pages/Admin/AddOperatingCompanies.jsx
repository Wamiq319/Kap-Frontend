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

const AddOperatingCompanyPage = () => {
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    opCompany: "",
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
    dispatch(fetchEntities({ endpoint: "op/companies" }));
  }, [dispatch]);

  const tableHeader = [
    { key: "index", label: "#" },
    { key: "opCompany", label: "Operating Companies" },
    { key: "image", label: "Logo Image" },
    { key: "adminName", label: "Admin Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ];

  const tableData = entities?.map((item, index) => ({
    index: index + 1,
    id: item._id,
    opCompany: item.opCompany,
    image: item.logoImage,
    mobile: item.mobile,
    adminName: item.adminName,
    username: item.username,
    password: item.password,
  }));

  const handleDelete = (entity) => {
    setConfirmDelete(entity);
  };

  const confirmDeleteAction = async () => {
    try {
      await dispatch(
        deleteEntity({ endpoint: "op", id: confirmDelete.id })
      ).unwrap();
      setToast({ message: "Entity deleted successfully!", type: "success" });
      dispatch(fetchEntities({ endpoint: "op/companies" }));
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, logoImage: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.opCompany ||
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
    formDataToSend.append("opCompany", formData.opCompany);
    formDataToSend.append("adminName", formData.adminName);
    formDataToSend.append("mobile", formData.mobile);
    formDataToSend.append("username", formData.username);
    formDataToSend.append("password", formData.password);

    try {
      const result = await dispatch(
        addEntity({
          endpoint: "op/create-Company",
          formData: formDataToSend,
        })
      ).unwrap();

      if (result.success) {
        setToast({ message: "Company added successfully!", type: "success" });
      } else {
        setErrorMessage(result.message);
        return;
      }

      dispatch(fetchEntities({ endpoint: "op/companies" }));
    } catch (error) {
      setToast({ message: error || "Unable to connect", type: "error" });
    }

    setIsModalOpen(false);
    setFormData({
      operatingCompanies: "",
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
          text="Add Operating Companies"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setEditMode(false);
            setFormData({
              operatingCompanies: "",
              logoImage: null,
              adminName: "",
              mobile: "",
              username: "",
              password: "",
            });
            setIsModalOpen(false);
          }}
          title="Add Operating Companies"
        >
          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            <InputField
              label="Operating Companies"
              name="opCompany"
              placeholder="Enter operating companies"
              value={formData.operatingCompanies}
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
                onClick={() => setIsModalOpen(false)}
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
        heading="ADD COMPANIES"
        tableHeader={tableHeader}
        tableData={tableData}
        headerBgColor="bg-blue-200"
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

export default AddOperatingCompanyPage;
