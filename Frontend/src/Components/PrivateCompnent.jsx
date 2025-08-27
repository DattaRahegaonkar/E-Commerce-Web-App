import React from "react";
import { Outlet, Navigate } from "react-router-dom";

const PrivateCompnent = () => {
  const auth = localStorage.getItem("user");
  return auth ? <Outlet /> : <Navigate to="signup" />;
};

export default PrivateCompnent;
