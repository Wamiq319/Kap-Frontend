import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import {
  fetchEntities,
  addEntity,
  deleteEntity,
} from "../../redux/slices/adminCrudSlice";
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

const AddGovSectorPage = () => {
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);
  const words = useSelector((state) => state.lang.words);

  const [formData, setFormData] = useState({
    govSector: "",
    logoImage: null,
    adminName: "",
    mobile: "+966",
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
    { key: "index", label: words["#"] || "#" },
    {
      key: "govSector",
      label: words["Government Sector"] || "Government Sector",
    },
    { key: "image", label: words["Logo"] || "Logo" },
    { key: "adminName", label: words["Admin Name"] || "Admin Name" },
    { key: "mobile", label: words["Mobile No"] || "Mobile No" },
  ];

  const fetchData = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await dispatch(fetchEntities({ endpoint: "gov/sectors" }));
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
    govSector: item.govSector,
    image: item.logoImage,
    adminName: item.adminName,
    mobile: item.mobile,
  }));

  const handleDelete = (entity) => {
    setConfirmDelete({
      ids: [entity.id],
      isBulk: false,
      name: entity.govSector,
    });
  };

  const handleBulkDelete = (selectedIds) => {
    if (selectedIds.length === 0) {
      showToast(words["No Sectors  selected"], "warning");
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
      const response = await Promise.all(
        confirmDelete.ids.map((id) =>
          dispatch(deleteEntity({ endpoint: "gov/delete", id }))
        )
      );

      const message = confirmDelete.isBulk
        ? `${words["Deleted"]} ${confirmDelete.ids.length} ${words["Sectors"]}`
        : `${words["Deleted"]} ${confirmDelete.name}`;

      showToast(message, "success");
      fetchData();
    } catch (error) {
      showToast(
        confirmDelete.isBulk
          ? words["Bulk delete failed"] || "Bulk delete failed"
          : words["Delete failed"] || "Delete failed",
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
      !formData.govSector ||
      !formData.adminName ||
      !formData.mobile ||
      !formData.logoImage
    ) {
      setUiState((prev) => ({
        ...prev,
        errorMessage:
          words["Please complete all fields"] || "Please complete all fields",
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
        addEntity({ endpoint: "gov/create-sector", formData: formDataToSend })
      ).unwrap();

      if (response.success) {
        showToast(response.message, "success");
        resetForm();
        fetchData();
      } else {
        showToast(response.message, "error");
        resetForm();
        fetchData();
      }
    } catch (error) {
      showToast(
        error.message ||
          words["Failed to add sector"] ||
          "Failed to add sector",
        "error"
      );
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
      govSector: "",
      logoImage: null,
      adminName: "",
      mobile: "+966",
    });
  };

  return (
    <div className="p-4">
      <ConfirmationModal
        isOpen={confirmDelete.ids.length > 0}
        onClose={() => setConfirmDelete({ ids: [], isBulk: false, name: "" })}
        onConfirm={confirmDeleteAction}
        title={
          confirmDelete.isBulk
            ? words["Confirm Bulk Delete"] || "Confirm Bulk Delete"
            : words["Confirm Delete"] || "Confirm Delete"
        }
        message={
          confirmDelete.isBulk
            ? (
                words["Delete $1 selected sectors?"] ||
                "Delete $1 selected sectors?"
              ).replace("$1", confirmDelete.ids.length)
            : `${words["Delete"] || "Delete"} ${confirmDelete.name}?`
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
          text={words["Add Government Sector"]}
          onClick={() => setUiState((prev) => ({ ...prev, isModalOpen: true }))}
          className="bg-green-600 hover:bg-green-700 text-lg font-semibold py-3 mb-2 shadow"
        />
      </div>

      {uiState.isModalOpen && (
        <Modal
          isOpen={uiState.isModalOpen}
          onClose={() => {
            resetForm();
            setUiState((prev) => ({ ...prev, isModalOpen: false }));
          }}
          title={words["Add Government Sector"]}
        >
          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
          >
            <InputField
              label={words["Government Sector"] || "Government Sector"}
              name="govSector"
              placeholder={words["Enter sector name"] || "Enter sector name"}
              value={formData.govSector}
              onChange={handleChange}
            />
            <ImageInput
              label={words["Logo Image"] || "Logo Image"}
              name="logoImage"
              onChange={handleImageChange}
              required={true}
            />
            <InputField
              label={words["Admin Name"] || "Admin Name"}
              name="adminName"
              placeholder={
                words["Enter admin full name"] || "Enter admin full name"
              }
              value={formData.adminName}
              onChange={handleChange}
            />
            <InputField
              label={words["Mobile Number"] || "Mobile Number"}
              name="mobile"
              placeholder="+9665XXXXXXXX"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
            />

            {uiState.errorMessage && (
              <p className="text-red-500 text-sm col-span-2">
                {uiState.errorMessage}
              </p>
            )}
            <div className="col-span-2 flex justify-end gap-2">
              <Button
                text={words["Cancel"] || "Cancel"}
                onClick={() =>
                  setUiState((prev) => ({ ...prev, isModalOpen: false }))
                }
                className="bg-gray-500 hover:bg-gray-700"
              />
              <Button
                text={
                  uiState.isLoading ? words["Creating...."] : words["Create"]
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
          heading={words["Government Sectors"] || "Government Sectors"}
          tableHeader={tableHeader}
          tableData={tableData}
          headerBgColor="bg-green-200"
          bulkActions={[
            {
              text: words["Remove Selected"],
              icon: <FaTrash className="text-white" />,
              className: "bg-red-500 hover:bg-red-600 text-white",
              onClick: handleBulkDelete,
            },
          ]}
          buttons={[
            {
              text: words["Delete"] || "Delete",
              icon: <FaTrash className="text-white" />,
              className: "bg-red-500 hover:bg-red-600 text-white",
              onClick: handleDelete,
            },
          ]}
        />
      )}
    </div>
  );
};

export default AddGovSectorPage;
