
import React from "react";

const BottomSafeArea = ({ backgroundColor = "#ffffff" }) => {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div
      style={{
        height: isIos ? "env(safe-area-inset-bottom)" : "0px",
        backgroundColor,
        width: "100%",
      }}
    />
  );
};

export default BottomSafeArea;
