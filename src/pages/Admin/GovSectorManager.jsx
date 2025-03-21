import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome, FaEdit, FaTrash } from "react-icons/fa";
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
  Dropdown,
  ToastNotification,
  ConfirmationModal,
  Modal,
} from "../../components";

const AddGovManagerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { entities } = useSelector((state) => state.adminCrud);

  // State for form data, including sectorId
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    username: "",
    password: "",
  });

  const [editPassword, setEditPassword] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(null);

  // Dropdown options (array of objects with sectorName and sectorId)
  const options = [
    { sectorName: "Sector 1", sectorId: "1" },
    { sectorName: "Sector 2", sectorId: "2" },
    { sectorName: "Sector 3", sectorId: "3" },
    { sectorName: "Sector 4", sectorId: "4" },
    { sectorName: "Sector 5", sectorId: "5" },
  ];

  // Fetch entities on component mount
  useEffect(() => {
    dispatch(fetchEntities({ endpoint: "Gov/get-Employees" }));
  }, [dispatch]);

  // Table headers
  const tableHeader = [
    { key: "index", label: "#" },
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "sector", label: "Gov Sector" },
    { key: "password", label: "Password" },
  ];

  // Convert entities to table data format
  const tableData = entities?.map((item, index) => ({
    index: index + 1,
    id: item._id,
    name: item.name,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
    sector: item.sector,
  }));

  const handleEditPassword = (entity) => {
    setEditPassword(true);
    setSelectedEntityId(entity.id);
    setFormData({ oldPassword: "", password: "" });
    setIsModalOpen(true);
  };

  // Handle delete action
  const handleDelete = (entity) => setConfirmDelete(entity);

  // Confirm delete action
  const confirmDeleteAction = async () => {
    try {
      await dispatch(
        deleteEntity({ endpoint: "govManager", id: confirmDelete.id })
      ).unwrap();
      setToast({ message: "Manager deleted successfully!", type: "success" });
      dispatch(fetchEntities({ endpoint: "gov/get-Managers" }));
    } catch (error) {
      setToast({ message: error || "Failed to delete entity.", type: "error" });
    }
    setConfirmDelete(null);
  };

  // Handle bulk delete
  const handleBulkDelete = async (selectedIds) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          dispatch(deleteEntity({ endpoint: "govManager", id })).unwrap()
        )
      );
      setToast({
        message: "Selected entities deleted successfully!",
        type: "success",
      });
      dispatch(fetchEntities({ endpoint: "gov/get-Managers" }));
    } catch (error) {
      setToast({
        message: error || "Failed to delete selected entities.",
        type: "error",
      });
    }
  };

  // Handle input change for form fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle dropdown change
  const handleDropdownChange = (value) => {
    setFormData({ ...formData, sectorId: value }); // Update sectorId in formData
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (editPassword) {
        if (!formData.oldPassword || !formData.password) {
          setErrorMessage("Please enter both passwords");
          return;
        }
        await dispatch(
          updateEntity({ endpoint: "Gov", id: selectedEntityId, formData })
        ).unwrap();
        setToast({
          message: "Password updated successfully!",
          type: "success",
        });
      } else {
        if (
          !formData.employeeName ||
          !formData.jobTitle ||
          !formData.mobile ||
          !formData.username ||
          !formData.password ||
          !formData.sectorId
        ) {
          setErrorMessage("Please complete all fields.");
          return;
        }
        await dispatch(
          addEntity({ endpoint: "Gov/create-GovEmployee", formData })
        ).unwrap();
        setToast({ message: "Entity added successfully!", type: "success" });
      }
      dispatch(fetchEntities({ endpoint: "Gov/get-Companies" }));
    } catch (error) {
      setToast({ message: error || "Unable to connect", type: "error" });
    }

    setIsModalOpen(false);
    setEditPassword(false);
    setFormData({
      employeeName: "",
      jobTitle: "",
      mobile: "",
      username: "",
      password: "",
      sectorId: "",
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
          message={`Are you sure you want to delete ${confirmDelete.jobTitle}?`}
        />
      )}

      <div className="flex justify-center">
        <Button
          text="Add Government Manager"
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setEditPassword(false);
            setFormData({
              employeeName: "",
              jobTitle: "",
              mobile: "",
              username: "",
              password: "",
              sectorId: "",
            });
            setIsModalOpen(false);
          }}
          title={editPassword ? "Reset Password" : "Add Government Manager"}
        >
          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            {!editPassword ? (
              <>
                <InputField
                  label="Name"
                  name="employeeName"
                  placeholder="Enter integration details"
                  value={formData.employeeName}
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
                <Dropdown
                  label="Choose Sector"
                  options={options.map((option) => ({
                    value: option.sectorId, // Use sectorId as value
                    label: option.sectorName, // Use sectorName as label
                  }))}
                  selectedValue={formData.sectorId} // Use formData.sectorId
                  onChange={handleDropdownChange} // Handle dropdown change
                />
                <InputField
                  label="Password"
                  name="password"
                  placeholder="Enter password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <InputField
                  label="Old-Password"
                  name="oldPassword"
                  placeholder="Enter old password"
                  type="password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                />
                <InputField
                  label="New Password"
                  name="password"
                  placeholder="Enter new password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </>
            )}
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
        heading="Gov COMPANIES"
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
            text: "Reset-Password",
            icon: <FaEdit />,
            className: "bg-red-500",
            onClick: handleEditPassword,
          },
        ]}
      />
    </div>
  );
};

export default AddGovManagerPage;
