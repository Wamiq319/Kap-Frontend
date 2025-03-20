import React from "react";
import { useState } from "react";

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
  const inputTypes = {
    username: "text",
    email: "email",
    password: "password",
    mobile: "tel",
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <input
        type={inputTypes[name] || "text"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        accept="image/*"
        className="w-full p-2 border border-gray-300 rounded-md"
      />
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
      className={`p-2 text-white rounded-md  transition ${className}`}
    >
      {text}
    </button>
  );
};

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
