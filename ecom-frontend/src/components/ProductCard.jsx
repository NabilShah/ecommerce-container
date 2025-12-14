import { Card, CardContent, CardMedia, Typography, Button, Box, Chip, CardActions, Rating,} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Link } from "react-router-dom";

export default function ProductCard({ product = {} }) {
  const imageUrl = product.images?.[0] ? `${process.env.REACT_APP_IMAGE_URL}${product.images[0]}` : process.env.PUBLIC_URL + "/no_preview.png";
  
  const name = product.name || "Untitled product";
  const price = product.price ?? 0;
  const mrp = product.mrp ?? null;
  const rating = product.rating ?? 4.2;
  const badge = product.badge;

  return (
    <Card sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)", transition: "transform .25s ease, box-shadow .25s ease", height: "100%", display: "flex", flexDirection: "column", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 14px 40px rgba(15,23,42,0.12)", }, }} >
      <Box sx={{ position: "relative", width: "100%", height: 200, bgcolor: "#fafafa", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", p: 1, }} >
        {badge && (
          <Chip icon={<LocalOfferIcon sx={{ fontSize: 16 }} />} label={badge} size="small" sx={{ position: "absolute", top: 10, left: 10, zIndex: 2, fontWeight: 700 }} color="primary" />
        )}

        <Box
          sx={{ width: "88%", height: "86%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2, backgroundColor: "#ffffff", boxShadow: "0 6px 18px rgba(15,23,42,0.06)", transition: "box-shadow .25s ease, transform .25s ease", "&:hover": { boxShadow: "0 18px 40px rgba(15,23,42,0.12)", transform: "translateY(-4px)", }, "& img": { width: "84%", height: "84%", objectFit: "contain", borderRadius: 1.5, transition: "transform .45s cubic-bezier(.2,.8,.2,1)", transformOrigin: "center center", display: "block", }, "&:hover img": { transform: "scale(1.12)", }, ".MuiPaper-root:hover & img": { transform: "scale(1.06)", }, }} >
          <CardMedia component="img" image={imageUrl} alt={name} />
        </Box>
      </Box>

      <CardContent sx={{ pt: 1, pb: 0, flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1, mb: 0.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", }} title={name} >
          {name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Rating value={Number(rating)} precision={0.5} size="small" readOnly />
          <Typography variant="caption" color="text.secondary">
            ({product.reviewsCount ?? 4})
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            ₹{Number(price).toLocaleString()}
          </Typography>
          {mrp && (
            <Typography variant="body2" sx={{ textDecoration: "line-through", color: "text.disabled" }}>
              ₹{Number(mrp).toLocaleString()}
            </Typography>
          )}
          <Typography variant="caption" color={product.stock > 0 ? "success.main" : "error.main"} >
            {product.stock > 0 ? `${product.stock} left in stock` : "Out of Stock"}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Button component={Link} to={`/products/${product._id}`} variant="contained" fullWidth sx={{ py: 1, borderRadius: 1.5, background: "linear-gradient(180deg,#ff7a00,#ff6a00)", fontWeight: 700, textTransform: "none", "&:hover": { background: "linear-gradient(180deg,#ff8a2a,#ff6a00)" }, }} >
          Checkout
        </Button>
      </CardActions>
    </Card>
  );
}