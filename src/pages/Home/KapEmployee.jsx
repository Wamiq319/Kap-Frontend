import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEntities,
  addEntity,
  fetchNames,
} from "../../redux/adminCrudSlice";
import {
  DataTable,
  Button,
  InputField,
  ToastNotification,
  Modal,
  Loader,
  Dropdown,
  ImageInput,
  DatePicker,
} from "../../components";

const KAPEmployeeHomePage = () => {
  const dispatch = useDispatch();
  const { entities } = useSelector((state) => state.adminCrud);

  const [requestors, setRequestors] = useState([]);
  const [operators, setOperators] = useState([]);
  const locations = ["location1", "location2", "location3"];

  const [formData, setFormData] = useState({
    requestType: "",
    ticketNumber: "",
    location: locations[0],
    operator: "",
    requestor: "",
    orderDate: "",
    attachment: null,
  });

  const [uiState, setUiState] = useState({
    showToast: false,
    toastMessage: "",
    toastType: "success",
    errorMessage: "",
    isModalOpen: false,
    isLoading: false,
  });

  const tableHeaders = [
    { key: "index", label: "#" },
    { key: "requestType", label: "Request Type" },
    { key: "ticketNumber", label: "Ticket Number" },
    { key: "location", label: "Location" },
    { key: "operator", label: "Operator" },
    { key: "requestor", label: "Requestor" },
    { key: "orderDate", label: "Order Date" },
    { key: "attachment", label: "Attachment" },
  ];

  const companyOptions = operators?.map((operator) => ({
    value: operator.id,
    label: operator.companyName,
  }));

  const sectorOptions = requestors?.map((requestor) => ({
    value: requestor.id,
    label: requestor.sectorName,
  }));

  const fetchData = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));

      const requestorResponse = await dispatch(
        fetchNames({ endpoint: "gov/sector-names" })
      );
      setRequestors(requestorResponse.payload.names);

      const operatorResponse = await dispatch(
        fetchNames({ endpoint: "op/company-names" })
      );
      setOperators(operatorResponse.payload.names);

      await dispatch(fetchEntities({ endpoint: "tickets" }));
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
    requestType: item.requestType,
    ticketNumber: item.ticketNumber,
    location: item.location,
    operator: item.operator,
    requestor: item.requestor,
    orderDate: new Date(item.orderDate).toLocaleDateString(),
    attachment: item.attachment ? "File Attached" : "No Attachment",
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      attachment: e.target.files?.[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.requestType ||
      !formData.ticketNumber ||
      !formData.orderDate
    ) {
      setUiState((prev) => ({
        ...prev,
        errorMessage: "Please complete all required fields",
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
        addEntity({ endpoint: "tickets/create", formData: formDataToSend })
      ).unwrap();

      if (response.success) {
        showToast(response.message, "success");
        resetForm();
        fetchData();
      }
    } catch (error) {
      showToast(error.message || "Failed to create ticket", "error");
    } finally {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
        isModalOpen: false,
      }));
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
      requestType: "",
      ticketNumber: "",
      location: locations[0],
      operator: "",
      requestor: "",
      orderDate: "",
      attachment: null,
    });
    setUiState((prev) => ({ ...prev, errorMessage: "" }));
  };

  const closeModal = () => {
    resetForm();
    setUiState((prev) => ({ ...prev, isModalOpen: false }));
  };

  return (
    <div className="p-4">
      {uiState.showToast && (
        <ToastNotification
          message={uiState.toastMessage}
          type={uiState.toastType}
          onClose={() => setUiState((prev) => ({ ...prev, showToast: false }))}
        />
      )}

      <div className="flex justify-center mb-6">
        <Button
          text="Create Ticket"
          onClick={() => setUiState((prev) => ({ ...prev, isModalOpen: true }))}
          className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold py-3 shadow"
        />
      </div>

      <Modal
        isOpen={uiState.isModalOpen}
        onClose={closeModal}
        title="Create Ticket"
      >
        <form
          onSubmit={handleSubmit}
          className="md:grid md:grid-cols-2 flex flex-wrap gap-4"
        >
          <InputField
            label="Request Type"
            name="requestType"
            placeholder="Enter request type"
            value={formData.requestType}
            onChange={handleChange}
            required
          />

          <InputField
            label="Ticket Number"
            name="ticketNumber"
            placeholder="Enter ticket number"
            value={formData.ticketNumber}
            onChange={handleChange}
            required
          />

          <Dropdown
            label="Location"
            options={locations.map((loc) => ({ value: loc, label: loc }))}
            selectedValue={formData.location}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, location: value }))
            }
          />

          <Dropdown
            label="Operator"
            options={companyOptions}
            selectedValue={formData.operator}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, operator: value }))
            }
          />

          <Dropdown
            label="Requestor"
            options={sectorOptions}
            selectedValue={formData.requestor}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, requestor: value }))
            }
          />

          <DatePicker
            label="Order Date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            required
          />
          <ImageInput
            label="Attachment"
            name="attachment"
            onChange={handleFileChange}
          />

          {uiState.errorMessage && (
            <p className="text-red-500 text-sm col-span-2">
              {uiState.errorMessage}
            </p>
          )}

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <Button
              text="Cancel"
              onClick={closeModal}
              type="button"
              className="bg-gray-500 hover:bg-gray-700"
            />
            <Button
              text={uiState.isLoading ? "Submitting..." : "Submit"}
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={uiState.isLoading}
            />
          </div>
        </form>
      </Modal>

      {uiState.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={8} opacity={90} />
        </div>
      ) : (
        <DataTable
          heading="Tickets"
          tableHeader={tableHeaders}
          tableData={tableData}
          headerBgColor="bg-gray-200"
          rowHoverEffect={true}
        />
      )}
    </div>
  );
};

export default KAPEmployeeHomePage;
