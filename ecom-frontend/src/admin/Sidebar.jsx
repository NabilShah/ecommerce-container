import { useState } from "react";
import { Drawer, List, ListItemButton, ListItemText, Fab, Box } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab color="primary" onClick={() => setOpen(!open)} sx={{ position: "fixed", bottom: 20, left: 20, zIndex: 2000 }} >
        {open ? <CloseIcon /> : <MenuIcon />}
      </Fab>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)} >
        <Box sx={{ width: 260, mt: 4 }}>
          <List>

            <ListItemButton component={Link} to="/admin/products" onClick={() => setOpen(false)}>
              <ListItemText primary="Products" />
            </ListItemButton>

            <ListItemButton component={Link} to="/admin/orders" onClick={() => setOpen(false)}>
              <ListItemText primary="Orders" />
            </ListItemButton>

            <ListItemButton component={Link} to="/admin/delivery-partners" onClick={() => setOpen(false)}>
              <ListItemText primary="Delivery Partners" />
            </ListItemButton>

            <ListItemButton component={Link} to="/admin/live-status" onClick={() => setOpen(false)}>
              <ListItemText primary="Live Status" />
            </ListItemButton>

          </List>
        </Box>
      </Drawer>
    </>
  );
}