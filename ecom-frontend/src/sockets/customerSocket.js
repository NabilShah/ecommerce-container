import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
});

// CUSTOMER ROOM
export const joinCustomerRoom = (customerId) => {
  socket.emit("joinCustomer", customerId);
};

// DELIVERY ROOM
export const joinDeliveryRoom = (deliveryId) => {
  socket.emit("joinDelivery", deliveryId);
};

// ADMIN ROOM
export const joinAdminRoom = () => {
  socket.emit("joinAdmin");
};

export default socket;