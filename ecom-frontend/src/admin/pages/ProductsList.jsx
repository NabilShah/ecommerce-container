import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import { Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { TableContainer, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import socket from "../../sockets/customerSocket";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;

    if (!user) {
      navigate("/admin/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, loadingUser, navigate]);

  useEffect(() => {
    api.get("/customer/products").then((res) => setProducts(res.data));
  }, []);

  useEffect(() => {

    socket.on("stockUpdated", ({ productId, stock }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, stock } : p
        )
      );
    });

    return () => {
      socket.off("stockUpdated");
    };
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await api.delete(`/admin/deleteProduct/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <>
      <Button
        variant="contained"
        component={Link}
        to="/admin/add-product"
        sx={{ mb: 2 }}
      >
        Add Product
      </Button>

      <TableContainer component={Paper} sx={{ overflowX: "auto", maxWidth: "100%", }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Edit</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: "#f5f5f5" }}>Delete</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.price}</TableCell>
                <TableCell>{p.stock}</TableCell>

                <TableCell>
                  <Button component={Link} to={`/admin/update-product/${p._id}`}>Edit</Button>
                </TableCell>

                <TableCell>
                  <Button color="error" onClick={() => deleteProduct(p._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}