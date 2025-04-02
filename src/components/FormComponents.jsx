import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ---------------------------------------------
   InputField Component
--------------------------------------------- */
export const InputField = ({
  required = true,
  label,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  type = "text",
  rows = 6,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputTypes = {
    username: "text",
    email: "email",
    password: "password",
    mobile: "tel",
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the input type (for password visibility toggle)
  const resolvedInputType =
    name === "password" && showPassword ? "text" : inputTypes[name] || type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="relative">
        {type === "textarea" ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        ) : (
          <input
            type={resolvedInputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        )}
        {name === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showPassword ? (
              <FaEyeSlash className="h-5 w-5 text-gray-500" />
            ) : (
              <FaEye className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------
   Dropdown Component
--------------------------------------------- */

export const Dropdown = ({
  required = true,
  label,
  options,
  selectedValue,
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle option selection
  const handleSelect = (value) => {
    onChange(value); // Pass the selected value (sectorId) to the parent
    setIsOpen(false);
  };

  // Find the selected label for display
  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label ||
    "Select an option";

  return (
    <div className={`w-full relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div
        className="w-full p-2 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span> {/* Display the selected label */}
        <FaChevronDown className="h-4 w-4 text-gray-500" />
      </div>
      {isOpen && (
        <div className="absolute w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg z-10">
          <div className="max-h-40 overflow-y-auto">
            {options.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(option.value)} // Pass the value (sectorId) to handleSelect
              >
                {option.label} {/* Display the label */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------
   Button Component
--------------------------------------------- */
export const Button = ({ text, onClick, color = "blue", className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-white rounded-md transition ${className}`}
    >
      {text}
    </button>
  );
};

/* ---------------------------------------------
   ImageInput Component
--------------------------------------------- */

export const ImageInput = ({
  label,
  onChange,
  className = "",
  required = false,
}) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic image validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onChange(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />

      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="h-32 object-contain border rounded-md"
          />
        </div>
      )}
    </div>
  );
};
/* ---------------------------------------------
   DatePicker Component
--------------------------------------------- */
export const DatePicker = ({
  label,
  name,
  value,
  onChange,
  className = "",
  required = false,
  minDate = null,
  maxDate = null,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Format the date to YYYY-MM-DD before sending to parent
    const formattedDate = date ? date.toISOString().split("T")[0] : "";
    onChange({ target: { name, value: formattedDate } });
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="w-full p-2 border border-gray-300 rounded-md pl-10"
          placeholderText="Select date"
          minDate={minDate}
          maxDate={maxDate}
        />
        <FiCalendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

/* ---------------------------------------------
   FileInput Component
--------------------------------------------- */

export const FileInput = ({
  required = true,
  label,
  name,
  onChange,
  className = "",
  accept = "*",
  multiple = false,
}) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(files); // Pass the FileList to parent component

      // Set the file name(s)
      if (files.length === 1) {
        setFileName(files[0].name);
      } else {
        setFileName(`${files.length} files selected`);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 transition">
          Choose File
          <input
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {fileName && <span className="text-sm text-gray-600">{fileName}</span>}
      </div>
    </div>
  );
};
