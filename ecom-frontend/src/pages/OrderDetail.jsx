import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosClient";
import socket, { joinCustomerRoom } from "../sockets/customerSocket";
import { AuthContext } from "../context/AuthContext";
import { Container, Typography, Chip, Box, Card, CardContent, Divider } from "@mui/material";
import { CheckCircle, LocalShipping, AccessTime, Cancel, Receipt } from "@mui/icons-material";

const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {

    case "unassigned":
      return { color: "warning", icon: <Receipt fontSize="small" />, label: "Unassigned" };

    case "accepted":
      return { color: "info", icon: <AccessTime fontSize="small" />, label: "Accepted" };

    case "picked_up":
      return { color: "primary", icon: <LocalShipping fontSize="small" />, label: "Picked Up" };

    case "on_the_way":
      return { color: "secondary", icon: <LocalShipping fontSize="small" />, label: "On The Way" };

    case "delivered":
      return { color: "success", icon: <CheckCircle fontSize="small" />, label: "Delivered" };

    case "cancelled":
      return { color: "error", icon: <Cancel fontSize="small" />, label: "Cancelled" };

    default:
      return { color: "default", icon: <Receipt fontSize="small" />, label: "Pending" };
  }
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    joinCustomerRoom(user.id);

    api.get(`/customer/orders/${id}`).then((res) => setOrder(res.data));

    socket.on("orderAssigned", (data) => {
      if (data._id === id) setOrder(data);
    });

    socket.on("orderUpdated", (data) => {
      if (data._id === id) setOrder(data);
    });

    return () => {
      socket.off("orderUpdated");
      socket.off("orderAssigned");
    };
  }, [user, id]);

  if (!order) return null;

  const status = getStatusConfig(order.status);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Order Details
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Order ID
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            #{order._id?.slice(-8).toUpperCase()}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip icon={status.icon} label={status.label} color={status.color} variant="outlined" sx={{ fontSize: 16, fontWeight: 600 }} />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Order Items
          </Typography>

          <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            {order.items.map((item, index) => (
              <Box key={index} sx={{ mb: 1.5 }}>
                <Typography variant="body1">
                  <strong>{item.product?.name || "Product"}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Qty: {item.qty}  
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ₹{item.price}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Total Amount:</strong> ₹{order.total}
          </Typography>

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Delivery Partner
          </Typography>

          {order.assignedTo ? (
            <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
              <Typography variant="body1">
                <strong>Name:</strong> {order.assignedTo.name}
              </Typography>            
              <Typography variant="body1">
                <strong>Email:</strong>{" "}
                <a href={`mailto:${order.assignedTo.email}`} style={{ color: "#1976d2", textDecoration: "none", fontWeight: 600 }} >{order.assignedTo.email}</a>
              </Typography>
              {order.assignedTo.phone && (
                <Typography variant="body1">
                  <strong>Phone:</strong>{" "}
                  <a href={`tel:${order.assignedTo.phone}`} style={{ color: "#1976d2", textDecoration: "none", fontWeight: 600 }} >{order.assignedTo.phone}</a>
                </Typography>
              )}
            </Box>
          ) : (
            <Typography color="error" sx={{ ml: 1 }}>
              No delivery partner assigned yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}