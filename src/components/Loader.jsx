import React from "react";

const Loader = ({ size = 8, opacity = 100 }) => {
  return (
    <div
      className={`border-4 border-solid rounded-full animate-spin`}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        borderWidth: `${size / 6}rem`,
        borderTopColor: `rgba(59, 130, 246, ${opacity / 100})`,
        borderRightColor: `rgba(191, 219, 254, 0.5)`,
        borderBottomColor: `rgba(191, 219, 254, 0.5)`,
        borderLeftColor: `rgba(191, 219, 254, 0.5)`,
      }}
    ></div>
  );
};

export default Loader;
