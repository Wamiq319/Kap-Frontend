import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome, FaTrash } from "react-icons/fa";
import { MdOutlineLockReset } from "react-icons/md";
import { createUser, getUsers } from "../../redux/authSlice";
import { fetchNames } from "../../redux/adminCrudSlice";

import {
  DataTable,
  Button,
  InputField,
  Dropdown,
  ToastNotification,
  ConfirmationModal,
  Modal,
} from "../../components";

const AddCompanyMangerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { names } = useSelector((state) => state.adminCrud);
  const { users, success, message } = useSelector((state) => state.auth);

  // State for form data, including companyId
  const [formData, setFormData] = useState({
    companyId: "",
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

  // Table headers
  const tableHeader = [
    { key: "index", label: "#" },
    { key: "name", label: "Manager Name" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "sector", label: "Gov Sector" },
    { key: "password", label: "Password" },
  ];

  // Fetch entities on component mount
  useEffect(() => {
    dispatch(fetchNames({ endpoint: "op/company-names" }));
    dispatch(getUsers("op-managers"));
  }, [dispatch]);

  // Dropdown options (array of objects with sectorName and companyId)
  const options = names?.map((name) => ({
    sectorName: name.companyName,
    companyId: name.id,
  }));

  // Convert entities to table data format
  const tableData = users?.map((item, index) => ({
    index: index + 1,
    id: item.id,
    name: item.name,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
    sector: item.sector,
  }));

  // Handle password editing
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
      // setToast({ message: "Manager deleted successfully!", type: "success" });
      dispatch(fetchEntities({ endpoint: "gov/get-Managers" }));
    } catch (error) {
      // setToast({ message: error || "Failed to delete entity.", type: "error" });
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
      // setToast({
      //   message: "Selected entities deleted successfully!",
      //   type: "success",
      // });
      dispatch(fetchEntities({ endpoint: "gov/get-Managers" }));
    } catch (error) {
      // setToast({
      //   message: error || "Failed to delete selected entities.",
      //   type: "error",
      // });
    }
  };

  // Handle input change for form fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle dropdown change
  const handleDropdownChange = (value) => {
    setFormData({ ...formData, companyId: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // Validate the form fields
      if (
        !formData.name ||
        !formData.mobile ||
        !formData.username ||
        !formData.password ||
        !formData.companyId
      ) {
        setErrorMessage("Please complete all fields.");
        return;
      }

      // Prepare the data to send in the form
      const formDataToSend = {
        name: formData.name,
        mobile: formData.mobile,
        username: formData.username,
        password: formData.password,
        companyId: formData.companyId,
        role: "op_manager",
      };

      // Dispatch createUser action
      const response = await dispatch(createUser(formDataToSend)).unwrap();

      // Handle success
      if (response.success) {
        setToast({
          message: "Company Manager added successfully!",
          type: "success",
        });
        setIsModalOpen(false);
        setFormData({
          name: "",
          mobile: "",
          username: "",
          password: "",
          companyId: "",
        });
        dispatch(getUsers("managers"));
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setToast({
        message: error.message || "Unable to connect to the server.",
        type: "error",
      });
    }
  };

  return (
    <div className="p-4">
      {/* Navigation button */}
      <button onClick={() => navigate("/manage-employees")} className="ml-4">
        <FaHome
          size={24}
          className="text-green-500 hover:text-green-700 transition"
        />
      </button>

      {/* Toast Notification */}
      {/* {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )} */}

      {/* Confirmation Modal for Delete */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteAction}
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${confirmDelete.jobTitle}?`}
        />
      )}

      {/* Add Government Manager Button */}
      <div className="flex justify-center">
        <Button
          text="Add Operating Company Manager"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

      {/* Modal for Add/Reset Password */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setEditPassword(false);
            setFormData({
              name: "",
              mobile: "",
              username: "",
              password: "",
              companyId: "",
            });
            setIsModalOpen(false);
          }}
          title={editPassword ? "Reset Password" : "Add Company Manager"}
        >
          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            {!editPassword ? (
              <>
                <InputField
                  label="Name"
                  name="name"
                  placeholder="Enter integration details"
                  value={formData.name}
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
                    value: option.companyId,
                    label: option.sectorName,
                  }))}
                  selectedValue={formData.companyId}
                  onChange={handleDropdownChange} // Ensure this correctly updates companyId
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

      {/* DataTable Component */}
      <DataTable
        heading="Operating Companies Managers"
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
            text: "Remove",
            icon: <FaTrash />,
            className: "bg-red-500",
            onClick: handleDelete,
          },
          {
            text: "Reset-Password",
            icon: <MdOutlineLockReset />,
            className: "bg-blue-500",
            onClick: handleEditPassword,
          },
        ]}
      />
    </div>
  );
};

export default AddCompanyMangerPage;
