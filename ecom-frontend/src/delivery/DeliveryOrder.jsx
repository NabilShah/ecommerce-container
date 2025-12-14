import { useEffect, useState, useContext } from "react";
import api from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { Table, TableHead, TableRow, TableCell, TableBody, Container, Typography, Button,} from "@mui/material";
import { useNavigate } from "react-router-dom";
import socket, { joinDeliveryRoom } from "../sockets/customerSocket";

export default function DeliveryOrder() {
  const [orders, setOrders] = useState([]);
  const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;
    if (!user || user.role !== "delivery") {
      navigate("/delivery/login");
    }
  }, [user, loadingUser, navigate]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const unassignedRes = await api.get("/delivery/unassigned");
        const myOrdersRes = await api.get("/delivery/my-orders");

        setOrders([...unassignedRes.data, ...myOrdersRes.data]);
      } catch (err) {
        console.error("Failed to load orders", err);
      }
    }
    loadOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/delivery/status/${orderId}`, { status: newStatus });
      const updatedOrder = res.data.order;

      setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    joinDeliveryRoom(user.id);

    const onOrderUpdated = (updated) => {
        setOrders((prev) =>
        prev.some((o) => o._id === updated._id) ? prev.map((o) => (o._id === updated._id ? updated : o)) : prev
        );
    };

    const onOrderAssigned = (updated) => {
        if (updated.assignedTo === user.id) {
        setOrders((prev) =>
            prev.some((o) => o._id === updated._id)
            ? prev.map((o) => (o._id === updated._id ? updated : o))
            : [...prev, updated]
        );
        }
    };

    const onNewOrder = (newOrder) => {
        setOrders((prev) => [...prev, newOrder]);
    };

    socket.on("orderUpdated", onOrderUpdated);
    socket.on("orderAssigned", onOrderAssigned);
    socket.on("newOrder", onNewOrder);

    return () => {
        socket.off("orderUpdated", onOrderUpdated);
        socket.off("orderAssigned", onOrderAssigned);
        socket.off("newOrder", onNewOrder);
    };
    }, [user]);

  const statuses = ["unassigned", "accepted", "picked_up", "on_the_way", "delivered", "cancelled"];

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
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 700, textTransform: "capitalize",
              color:
                status === "unassigned"
                  ? "red"
                  : status === "accepted"
                  ? "orange"
                  : status === "picked_up"
                  ? "blue"
                  : status === "on_the_way"
                  ? "purple"
                  : status === "delivered"
                  ? "green"
                  : "grey",
            }}
          >
            {status.replaceAll("_", " ")} ({grouped[status].length})
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Actions / Status</TableCell>
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
                          <strong>{o.customer.name}</strong>
                          <br />
                          {o.customer.email}
                          <br />
                          {o.customer.phone}
                        </>
                      ) : (
                        "Deleted User"
                      )}
                    </TableCell>

                    <TableCell>₹{o.total}</TableCell>

                    <TableCell>
                    {status === o.status ? (
                        o.status === "cancelled" ? (
                          <span style={{ padding: "6px 12px", background: "#e0e0e0", color: "#555", borderRadius: "4px", fontWeight: 600, textTransform: "capitalize", display: "inline-block" }} >
                            Cancelled
                          </span>
                        ) : o.status === "unassigned" ? (
                        <Button variant="contained" color="primary" size="small"
                            onClick={async () => {
                            try {
                                const res = await api.post(`/delivery/accept/${o._id}`);
                                setOrders((prev) =>
                                prev.map((ord) => (ord._id === o._id ? res.data.order : ord))
                                );
                            } catch (err) {
                                console.error(err);
                            }
                            }}
                        >
                          Accept
                        </Button>
                        ) : (
                        <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} style={{ padding: "6px", borderRadius: "4px" }} >
                            <option value={o.status}>{o.status.replaceAll("_", " ")}</option>

                            {o.status === "accepted" && <option value="picked_up">picked up</option>}
                            {o.status === "picked_up" && <option value="on_the_way">on the way</option>}
                            {o.status === "on_the_way" && <option value="delivered">delivered</option>}
                        </select>
                        )
                    ) : null}
                    </TableCell>

                    <TableCell>
                      {o.assignedTo ? (
                        <>
                          {o.assignedTo.name}
                          <br />
                          {o.assignedTo.phone}
                        </>
                      ) : (
                        <span style={{ color: "red" }}>Unassigned</span>
                      )}
                    </TableCell>

                    <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
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