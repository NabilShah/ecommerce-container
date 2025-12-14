import { useContext, useState } from "react";
import { TextField, Button, Paper, Typography, IconButton, InputAdornment, Snackbar, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info", });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setSnackbar({ open: true, message: "Please fill in all fields.", severity: "warning", });
      return;
    }

    if (!isValidEmail(form.email)) {
      setSnackbar({ open: true, message: "Please enter a valid email address.", severity: "warning", });
      return;
    }

    try {
      const res = await api.post("/auth/login", form);

      if (res.data.user.role !== "admin") {
        setSnackbar({ open: true, message: "Access Denied: Not an Admin.", severity: "error", });
        return;
      }

      login(res.data.token);
      setSnackbar({ open: true, message: "Admin login successful! Redirecting...", severity: "success", });

      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: "Invalid login credentials.", severity: "error", });
    }
  };

  return (
    <>
      <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
        <Typography variant="h5" mb={2}>
          Admin Login
        </Typography>

        <TextField fullWidth label="Email" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={form.email.length > 0 && !isValidEmail(form.email)} helperText={ form.email.length > 0 && !isValidEmail(form.email) ? "Enter a valid email address" : "" } />

        <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} >
          Login
        </Button>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }} >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}