import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome, FaEdit, FaTrash } from "react-icons/fa";
import { createUser, getUsers } from "../../redux/authSlice";
import {
  DataTable,
  Button,
  InputField,
  Dropdown,
  ConfirmationModal,
  Modal,
} from "../../components";

const AddKapEmployeePagee = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    username: "",
    jobTitle: "",
    password: "",
  });

  const [editPassword, setEditPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(null);

  const tableHeader = [
    { key: "index", label: "#" },
    { key: "name", label: "Employee Name" },
    { key: "jobTitle", label: "Job Title" },
    { key: "mobile", label: "Mobile No" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
  ];

  useEffect(() => {
    dispatch(getUsers("kap-employees"));
  }, [dispatch]);

  const jobTitleOptions = [
    { value: "Affair-officer", label: "Affair Officer" },
    { value: "Data-Entry", label: "Data Entry" },
    { value: "Ticket-Supervisor", label: "Ticket Supervisor" },
  ];

  const tableData = users?.map((item, index) => ({
    index: index + 1,
    id: item.id,
    name: item.name,
    jobTitle: item.jobTitle,
    mobile: item.mobile,
    username: item.username,
    password: item.password,
  }));

  const handleEditPassword = (entity) => {
    setEditPassword(true);
    setFormData({ oldPassword: "", password: "" });
    setIsModalOpen(true);
  };

  const handleDelete = (entity) => setConfirmDelete(entity);

  const confirmDeleteAction = async () => {
    try {
      await dispatch(
        deleteEntity({ endpoint: "govManager", id: confirmDelete.id })
      );
      dispatch(fetchEntities({ endpoint: "gov/get-Managers" }));
    } catch (error) {
      console.error("Delete error:", error);
    }
    setConfirmDelete(null);
  };

  const handleBulkDelete = async (selectedIds) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          dispatch(deleteEntity({ endpoint: "govManager", id }))
        )
      );
      dispatch(fetchEntities({ endpoint: "gov/get-Managers" }));
    } catch (error) {
      console.error("Bulk delete error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.name ||
      !formData.mobile ||
      !formData.username ||
      !formData.password ||
      !formData.jobTitle
    ) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    try {
      const formDataToSend = {
        name: formData.name,
        mobile: formData.mobile,
        username: formData.username,
        password: formData.password,
        jobTitle: formData.jobTitle,
        role: "kap_employee",
      };

      await dispatch(createUser(formDataToSend));
      setIsModalOpen(false);
      setFormData({
        name: "",
        jobTitle: "",
        mobile: "",
        username: "",
        password: "",
      });
      dispatch(getUsers("kap-employees"));
    } catch (error) {
      setErrorMessage(error.message || "Unable to connect to the server.");
    }
  };

  return (
    <div className="p-4">
      <button onClick={() => navigate("/manage-employees")} className="ml-4">
        <FaHome
          size={24}
          className="text-gray-500 hover:text-gray-700 transition"
        />
      </button>

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
          text="Add Kap Employee"
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-600 hover:bg-gray-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

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
              jobTitle: "",
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
                  name="name"
                  placeholder="Enter name"
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
                  label="Choose Job Role"
                  options={jobTitleOptions}
                  selectedValue={formData.jobTitle}
                  onChange={(value) =>
                    setFormData({ ...formData, jobTitle: value })
                  }
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
                  label="Old Password"
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
        heading="Kap Employees"
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
    </div>
  );
};

export default AddKapEmployeePagee;
