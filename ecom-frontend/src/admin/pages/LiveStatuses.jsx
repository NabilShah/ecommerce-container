import { useEffect, useState, useContext } from "react";
import api from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";
import { Table, TableHead, TableRow, TableCell, TableBody, Container, Typography, } from "@mui/material";
import { useNavigate } from "react-router-dom";
import socket, { joinAdminRoom } from "../../sockets/customerSocket";

export default function LiveStatuses() {
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
    api.get("/admin/orders").then((res) => setOrders(res.data));
  }, []);

    useEffect(() => {
      if (!user || user.role !== "admin") return;

      joinAdminRoom();

      const sortOrders = (list) => [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const onNewOrder = (order) => {
          setOrders(prev => sortOrders([order, ...prev]));
      };

      const onOrderAssigned = (updated) => {
        setOrders(prev =>
          sortOrders( prev.some(o => o._id === updated._id) ? prev.map(o => (o._id === updated._id ? updated : o)) : [updated, ...prev] )
        );
    };

    const onOrderUpdated = (updated) => {
        setOrders(prev =>
          sortOrders( prev.map(o => (o._id === updated._id ? updated : o)) )
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

  const statuses = [
    "unassigned",
    "accepted",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled",
  ];

  const grouped = statuses.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status);
    return acc;
  }, {});

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Live Order Status
      </Typography>

      {statuses.map((status) => (
    <Container key={status} sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textTransform: "capitalize", color: status === "unassigned" ? "red" : status === "accepted" ? "orange" : status === "picked_up" ? "blue" : status === "on_the_way" ? "purple" : status === "delivered" ? "green" : "grey" }}>
          {status.replaceAll("_", " ")} ({grouped[status].length})
        </Typography>

        <Table>
          <TableHead>
              <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Delivery Partner</TableCell>
              <TableCell>Placed On</TableCell>
              </TableRow>
          </TableHead>

          <TableBody>
              {grouped[status].length === 0 ? (
              <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                  No orders in this category
                  </TableCell>
              </TableRow>
              ) : (
              grouped[status].map((o) => (
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

                  <TableCell>₹{o.total}</TableCell>
                  <TableCell style={{ textTransform: "capitalize" }}>
                      {o.status.replaceAll("_", " ")}
                  </TableCell>

                  <TableCell>
                      {o.assignedTo ? (
                      <>
                          {o.assignedTo.name}<br />
                          {o.assignedTo.phone}
                      </>
                      ) : (
                      <span style={{ color: "red" }}>Unassigned</span>
                      )}
                  </TableCell>

                  <TableCell>
                      {new Date(o.createdAt).toLocaleString()}
                  </TableCell>
                  </TableRow>
              ))
              )}
          </TableBody>
        </Table>
    </Container>
    ))}
    </Container>
  );
}