import React from "react";

const StatusBarBackground = ({ backgroundColor = "#ffffff" }) => {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div
      style={{
        height: isIos ? "env(safe-area-inset-top)" : "0px",
        backgroundColor,
        width: "100%",
      }}
    />
  );
};

export default StatusBarBackground;
