import { useState } from "react";
import { TextField, Button, Paper, Typography, Box, IconButton, InputAdornment, Snackbar, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info", });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setSnackbar({ open: true, message: "Please fill in all fields.", severity: "warning", });
      return;
    }

    if (!isValidEmail(form.email)) {
      setSnackbar({ open: true, message: "Please enter a valid email address.", severity: "warning", });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match!", severity: "error", });
      return;
    }

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "customer",
      });

      setSnackbar({ open: true, message: "Registered successfully! Redirecting to login...", severity: "success", });

      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setSnackbar({ open: true, message: "Registration failed. Email may already exist.", severity: "error", });
    }
  };

  return (
    <>
      <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
        <Typography variant="h5" mb={2}>
          Create Account
        </Typography>

        <TextField fullWidth label="Name" margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <TextField fullWidth label="Email" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={form.email.length > 0 && !isValidEmail(form.email)}
          helperText={
            form.email.length > 0 && !isValidEmail(form.email)
              ? "Enter a valid email address"
              : ""
          }
        />

        <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField fullWidth label="Confirm Password" type={showConfirmPassword ? "text" : "password"} margin="normal" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} >
          Register
        </Button>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <Link to="/login" style={{ textDecoration: "none", color: "#1976d2", fontWeight: 500, cursor: "pointer", }} >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }} >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}