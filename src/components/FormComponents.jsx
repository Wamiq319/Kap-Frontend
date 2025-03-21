import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa"; // Import icons from React Icons

/* ---------------------------------------------
   InputField Component
--------------------------------------------- */
export const InputField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  className = "",
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

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          type={
            name === "password" && showPassword
              ? "text"
              : inputTypes[name] || "text"
          }
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {name === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showPassword ? (
              <FaEyeSlash className="h-5 w-5 text-gray-500" /> // Hide password icon
            ) : (
              <FaEye className="h-5 w-5 text-gray-500" /> // Show password icon
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
        <label className="block text-sm font-medium mb-1">{label}</label>
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
export const ImageInput = ({ label, name, onChange, className = "" }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onChange(file); // Pass the file to parent component

    // Generate preview URL
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-2 h-16 w-16 object-cover rounded-md border"
        />
      )}
    </div>
  );
};
