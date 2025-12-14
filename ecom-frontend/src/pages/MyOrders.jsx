import { useEffect, useState, useContext } from "react";
import api from "../api/axiosClient";
import socket, { joinCustomerRoom } from "../sockets/customerSocket";
import { AuthContext } from "../context/AuthContext";
import { Container, Typography, Box, Grid, Card, CardContent, Chip, Button, Divider, Stack, CircularProgress, Alert,} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { LocalShipping, CheckCircle, AccessTime, Cancel, Receipt,} from "@mui/icons-material";
import { format } from "date-fns";

export default function MyOrders() {
  const { user, loadingUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      navigate("/login");
      return;
    }

    joinCustomerRoom(user.id);

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/customer/orders");
        const sorted = [...res.data].sort((a, b) => {
          if (a.status === "cancelled" && b.status !== "cancelled") return 1;
          if (a.status !== "cancelled" && b.status === "cancelled") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setOrders(sorted);
      } catch (err) {
        setError("Failed to load your orders. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    socket.on("orderAssigned", (updatedOrder) => {
      setOrders((prev) => {
        const updated = prev.map((o) =>
          o._id === updatedOrder._id ? updatedOrder : o
        );

        return updated.sort((a, b) => {
          if (a.status === "cancelled" && b.status !== "cancelled") return 1;
          if (a.status !== "cancelled" && b.status === "cancelled") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) => {
        const updated = prev.map((o) =>
          o._id === updatedOrder._id ? updatedOrder : o
        );

        return updated.sort((a, b) => {
          if (a.status === "cancelled" && b.status !== "cancelled") return 1;
          if (a.status !== "cancelled" && b.status === "cancelled") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
    });


    return () => {
      socket.off("orderUpdated");
      socket.off("orderAssigned");
    };
  }, [user, loadingUser, navigate]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await api.put(`/customer/orders/${orderId}/cancel`);

      setOrders(prev =>
        prev.map(o => o._id === orderId ? res.data.order : o)
      );

    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", }}
      >
        My Orders
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Track, view, and manage all your orders in one place.
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress size={50} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && orders.length === 0 && (
        <Card variant="outlined" sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            When you place an order, it will appear here.
          </Typography>
          <Button component={Link} to="/shop" variant="contained" size="large">
            Start Shopping
          </Button>
        </Card>
      )}

      <Grid container spacing={3}>
        {orders.map((order) => {
          const status = getStatusConfig(order.status);

          return (
            <Grid item xs={12} key={order._id}>
              <Card elevation={2} sx={{ transition: "0.3s", "&:hover": { elevation: 6, boxShadow: 6 }, borderRadius: 2, }} >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Order ID
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            #{order._id.slice(-8).toUpperCase()}
                          </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Placed On
                          </Typography>
                          <Typography variant="body1">
                            {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a") : "N/A"}
                          </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Amount
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="primary">
                            ₹{order.total?.toFixed(2) || "0.00"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ md: "flex-end" }} justifyContent="flex-end" >
                        <Chip icon={status.icon} label={status.label} color={status.color} variant="outlined" sx={{ fontWeight: 600, height: 36 }} />

                        {(order.status !== "delivered" && order.status !== "cancelled") && (
                          <Button variant="outlined" color="error" size="medium" sx={{ minWidth: 140 }} onClick={() => cancelOrder(order._id)} >
                            Cancel Order
                          </Button>
                        )}

                        <Button component={Link} to={`/orders/${order._id}`} variant="contained" size="medium" sx={{ minWidth: 140 }} >
                          View Details
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>

                  {order.items && order.items.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        {order.items.reduce((sum, item) => sum + item.qty, 0)} item{order.items.reduce((sum, item) => sum + item.qty, 0) > 1 ? "s" : ""}{" "}•{" "}
                        {order.items.slice(0, 3).map((item) => item.product?.name || "Product").join(", ")}
                        {order.items.length > 3 && " and more..."}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}