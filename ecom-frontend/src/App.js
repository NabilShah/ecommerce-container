import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";

import ProductsList from "./admin/pages/ProductsList";
import AddProduct from "./admin/pages/AddProduct";
import UpdateProduct from "./admin/pages/UpdateProduct";
import Orders from "./admin/pages/Orders";
import DeliveryPartners from "./admin/pages/DeliveryPartners";
import LiveStatuses from "./admin/pages/LiveStatuses";

import DeliveryLogin from "./delivery/DeliveryLogin";
import DeliveryOrder from "./delivery/DeliveryOrder";

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Navbar loggedIn={!!user} onLogout={logout} />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/products" element={<AdminLayout><ProductsList /></AdminLayout>} />
        <Route path="/admin/add-product" element={<AdminLayout><AddProduct /></AdminLayout>} />
        <Route path="/admin/update-product/:id" element={<AdminLayout><UpdateProduct /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><Orders /></AdminLayout>} />
        <Route path="/admin/delivery-partners" element={<AdminLayout><DeliveryPartners /></AdminLayout>} />
        <Route path="/admin/live-status" element={<AdminLayout><LiveStatuses /></AdminLayout>} />

        <Route path="/delivery/login" element={<DeliveryLogin />} />
        <Route path="/delivery/orders" element={<DeliveryOrder />} />

        <Route path="*" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;