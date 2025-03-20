import React, { useEffect, useState } from "react";

const ToastNotification = ({ message, type = "success", onClose }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }[type];

  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 text-white ${bgColor} rounded-md shadow-lg transition-transform`}
    >
      {message}
    </div>
  );
};

export default ToastNotification;
