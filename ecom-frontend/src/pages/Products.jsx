import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import ProductCard from "../components/ProductCard";
import { Container, Typography, Box, TextField, InputAdornment, Select, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import socket from "../sockets/customerSocket";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    api.get("/customer/products").then((res) => setProducts(res.data || []));
  }, []);

  useEffect(() => {
    socket.on("productCreated", (newProduct) => {
      setProducts((prev) => [...prev, newProduct]);
    });

    socket.on("productUpdated", (updated) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    });

    socket.on("productDeleted", (id) => {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    });

    socket.on("stockUpdated", ({ productId, stock }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, stock } : p
        )
      );
    });

    return () => {
      socket.off("productCreated");
      socket.off("productUpdated");
      socket.off("productDeleted");
      socket.off("stockUpdated");
    };
  }, []);

  const filtered = products
    .filter((p) => p.name?.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (sort === "low") return Number(a.price) - Number(b.price);
      if (sort === "high") return Number(b.price) - Number(a.price);
      return 0;
    });

  return (
    <Container sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Latest Products
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3, flexDirection: { xs: "column", sm: "row" }, }} >
        <TextField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands, or categories" size="small" fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ minWidth: 140 }}>
          <Select  value={sort}  onChange={(e) => setSort(e.target.value)}  displayEmpty  size="small"  fullWidth >
            <MenuItem value="">Sort: Featured</MenuItem>
            <MenuItem value="low">Price: Low to High</MenuItem>
            <MenuItem value="high">Price: High to Low</MenuItem>
          </Select>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gap: 20 / 8, gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)", }, }} >
        {filtered.map((p) => (
          <Box key={p._id}>
            <ProductCard product={p} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}