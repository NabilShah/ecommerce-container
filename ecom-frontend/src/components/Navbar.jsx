import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isAdminLoginPage = location.pathname === "/admin/login";

  const isDelivery = user?.role === "delivery";
  const isDeliveryLoginPage = location.pathname === "/delivery/login";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isAdminLoginPage || isDeliveryLoginPage) return null;
  
  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const NavLinks = () => (
    <>
      {isAdmin || isDelivery ? (
        <Button color="inherit" onClick={logout}>
          Logout
        </Button>
      ) : (
        <>
          <Button color="inherit" component={Link} to="/products">
            Products
          </Button>
          <Button color="inherit" component={Link} to="/orders">
            My Orders
          </Button>
          {!user ? (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ mb: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: "none", color: "#fff", fontWeight: 700, letterSpacing: 0.5, }} >
            E-Commerce
          </Typography>

          {isAdmin || isDelivery ? (
            <Button color="inherit" onClick={logout} sx={{ display: "flex", ml: "auto" }} >
              Logout
            </Button>
          ) : (
            <>
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
                <NavLinks />
              </Box>

              <IconButton color="inherit" edge="end" sx={{ display: { xs: "block", md: "none" } }} onClick={toggleDrawer} >
                <MenuIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {!isAdmin || !isDelivery && (
        <Drawer anchor="right" open={mobileOpen} onClose={toggleDrawer} sx={{ "& .MuiDrawer-paper": { width: 240, backgroundColor: "#1976d2", color: "#fff", }, }} >
          <List>
            <ListItem button component={Link} to="/products" onClick={toggleDrawer} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }} >
              <ListItemText primary="Products" primaryTypographyProps={{ sx: { color: "#fff" } }} />
            </ListItem>

            <ListItem button component={Link} to="/orders" onClick={toggleDrawer} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }} >
              <ListItemText primary="My Orders" primaryTypographyProps={{ sx: { color: "#fff" } }} />
            </ListItem>

            {!user ? (
              <ListItem button component={Link} to="/login" onClick={toggleDrawer} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }} >
                <ListItemText primary="Login" primaryTypographyProps={{ sx: { color: "#fff" } }} />
              </ListItem>
            ) : (
              <ListItem button onClick={() => { logout(); toggleDrawer(); }} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }} >
                <ListItemText primary="Logout" primaryTypographyProps={{ sx: { color: "#fff" } }} />
              </ListItem>
            )}
          </List>
        </Drawer>
      )}
    </>
  );
}