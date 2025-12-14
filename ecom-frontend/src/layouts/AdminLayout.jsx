import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../admin/Sidebar";
import { Box } from "@mui/material";

export default function AdminLayout({ children }) {
  const { user, loadingUser } = useContext(AuthContext);

  if (loadingUser) {
    return null;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" />;
  }

  return (
    <Box sx={{ minHeight: "100vh", p: 2 }}>
      <Sidebar />
      {children}
    </Box>
  );
}
