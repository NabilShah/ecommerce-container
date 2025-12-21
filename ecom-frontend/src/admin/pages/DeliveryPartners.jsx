import { useEffect, useState, useContext } from "react";
import api from "../../api/axiosClient";
import { Table, TableHead, TableRow, TableCell, TableBody, Container, Typography } from "@mui/material";
import { TableContainer, Paper } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;

    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, loadingUser, navigate]);

  useEffect(() => {
    api.get("/admin/delivery-partners").then((res) => setPartners(res.data));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Delivery Partners
      </Typography>

      <TableContainer component={Paper} sx={{ overflowX: "auto", maxWidth: "100%", }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {partners.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.phone || "N/A"}</TableCell>

                <TableCell style={{ color: p.isAvailable ? "green" : "red" }}>
                  {p.isAvailable ? "Available" : "Busy"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}