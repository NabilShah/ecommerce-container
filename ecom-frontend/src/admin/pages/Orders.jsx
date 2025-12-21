import { useEffect, useState, useContext } from "react";
import api from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";
import { Table, TableHead, TableRow, TableCell, TableBody, Container, Typography, } from "@mui/material";
import { TableContainer, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import socket, { joinAdminRoom } from "../../sockets/customerSocket";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, loadingUser, navigate]);

  useEffect(() => {
    async function loadOrders() {
      const res = await api.get("/admin/orders");
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    }
    loadOrders();
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    joinAdminRoom();

    const sortOrders = (list) =>
      [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const onNewOrder = (order) => {
      setOrders((prev) => sortOrders([order, ...prev]));
    };

    const onOrderAssigned = (updated) => {
      setOrders((prev) =>
        sortOrders( prev.some((o) => o._id === updated._id) ? prev.map((o) => (o._id === updated._id ? updated : o)) : [updated, ...prev] )
      );
    };

    const onOrderUpdated = (updated) => {
      setOrders((prev) =>
        sortOrders(
          prev.map((o) => (o._id === updated._id ? updated : o))
        )
      );
    };

    socket.on("newOrder", onNewOrder);
    socket.on("orderAssigned", onOrderAssigned);
    socket.on("orderUpdated", onOrderUpdated);

    return () => {
      socket.off("newOrder", onNewOrder);
      socket.off("orderAssigned", onOrderAssigned);
      socket.off("orderUpdated", onOrderUpdated);
    };
  }, [user]);

  const formatAddress = (shipping) => {
    if (!shipping) return "—";

    return [shipping.address, shipping.city, shipping.pin]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        All Orders
      </Typography>

      <TableContainer component={Paper} sx={{ overflowX: "auto", maxWidth: "100%", }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Placed On</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((o) => (
              <TableRow key={o._id}>
                <TableCell>{o._id}</TableCell>

                <TableCell>
                  {o.customer ? (
                    <>
                      <strong>{o.customer.name}</strong><br />
                      {o.customer.email}<br />
                      {o.customer.phone}
                    </>
                  ) : "Deleted User"}
                </TableCell>

                <TableCell>{formatAddress(o.shipping)}</TableCell>

                <TableCell>₹{o.total}</TableCell>

                <TableCell>
                  {new Date(o.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}