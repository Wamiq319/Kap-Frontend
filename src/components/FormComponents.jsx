import React from "react";

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
