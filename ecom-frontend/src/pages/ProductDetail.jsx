import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { Button, Container, Typography, Box, TextField, Paper, Grid, MenuItem, Divider, Select, FormControl, InputLabel, Chip,} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import socket from "../sockets/customerSocket";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/customer/products/${id}`);
        const p = res.data;
        setProduct(p);

        if (p?.stock === 0) setQty(0);
        else setQty(1);
      } catch (err) {
        console.error("Failed to load product", err);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    socket.on("stockUpdated", ({ productId, stock }) => {
      if (productId === id) {
        setProduct((prev) => ({ ...prev, stock }));
      }
    });

    return () => socket.off("stockUpdated");
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const s = Number(product.stock || 0);
    if (qty > s) setQty(s);
    if (qty < 1 && s > 0) setQty(1);
  }, [product, qty]);

  const validate = () => {
    if (!user) {
      alert("Please login to continue.");
      navigate("/login");
      return false;
    }
    if (!address) {
      alert("Please enter shipping address.");
      return false;
    }
    if (!city) {
      alert("Please enter city.");
      return false;
    }
    if (!pin) {
      alert("Please enter PIN / ZIP code.");
      return false;
    }
    if (!product) {
      alert("Product not loaded.");
      return false;
    }
    const stock = Number(product.stock || 0);
    if (stock === 0) {
      alert("Sorry, this product is out of stock.");
      return false;
    }
    if (Number(qty) < 1 || Number(qty) > stock) {
      alert(`Please select a quantity between 1 and ${stock}.`);
      setQty(Math.max(1, Math.min(stock, Number(qty) || 1)));
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;

    setPlacing(true);
    try {
      const payload = {
        shipping: {
          address,
          city,
          pin,
        },
        paymentMethod,
        items: [
          {
            product: product._id,
            qty: Number(qty),
            price: product.price,
          },
        ],
      };

      await api.post("/customer/orders", payload);

      alert("Order placed!");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while placing the order.");
    } finally {
      setPlacing(false);
    }
  };

  if (!product) return null;

  const subtotal = Number(product.price || 0) * Number(qty || 1);
  const delivery = 40;
  const taxes = Math.round((subtotal * 0.05) * 100) / 100;
  const total = subtotal + delivery + taxes;
  const stock = Number(product.stock || 0);
  const outOfStock = stock === 0;

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Checkout — {product.name}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        {outOfStock ? (
          <Chip label="Out of stock" color="error" />
        ) : (
          <Chip label={`In stock: ${stock}`} color="success" />
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Shipping Address
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="PIN / ZIP" value={pin} onChange={(e) => setPin(e.target.value)} fullWidth size="small" />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Payment
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="pm-label">Method</InputLabel>
              <Select labelId="pm-label" value={paymentMethod} label="Method" onChange={(e) => setPaymentMethod(e.target.value)} >
                <MenuItem value="cod">Cash on Delivery</MenuItem>
                <MenuItem value="card">Card (demo)</MenuItem>
                <MenuItem value="upi">UPI (demo)</MenuItem>
              </Select>
            </FormControl>

            {paymentMethod === "card" && (
              <Box>
                <TextField label="Card number" placeholder="1234 5678 9012 3456" fullWidth size="small" sx={{ mb: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField label="MM/YY" fullWidth size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="CVV" fullWidth size="small" />
                  </Grid>
                </Grid>
              </Box>
            )}

            {paymentMethod === "upi" && (
              <TextField label="UPI ID" placeholder="yourname@bank" fullWidth size="small" />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Order Summary
            </Typography>

            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <Box sx={{ width: 96, height: 96, bgcolor: "#fafafa", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", }} >
                <img src={ product.images?.[0] ? `${process.env.REACT_APP_IMAGE_URL}${product.images[0]}` : "https://via.placeholder.com/150" } alt={product.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle1" noWrap title={product.name}>
                  {product.name}
                </Typography>

                <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Qty:
                  </Typography>
                  <TextField value={qty} type="number" size="small" inputProps={{ min: 1, max: stock }} sx={{ width: 110 }} disabled={outOfStock}
                    onChange={(e) => {
                      let v = Number(e.target.value || 0);
                      if (isNaN(v)) v = 1;
                      if (v < 1) v = 1;
                      if (v > stock) v = stock;
                      setQty(v);
                    }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  ₹{Number(product.price).toLocaleString()}
                </Typography>
                <Typography variant="caption" color={stock > 0 ? "text.secondary" : "error"}>
                  {stock > 0 ? `${stock} available` : "Currently unavailable"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography>₹{subtotal.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Delivery</Typography>
              <Typography>₹{delivery}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Taxes (5%)</Typography>
              <Typography>₹{taxes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
            </Box>

            <Button variant="contained" fullWidth onClick={placeOrder} disabled={placing || outOfStock} sx={{ py: 1.5, textTransform: "none", background: "linear-gradient(180deg,#ff7a00,#ff6a00)" }} >
              {placing ? "Placing order..." : outOfStock ? "Out of stock" : "Place Order"}
            </Button>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Need help? contact support@example.com
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}