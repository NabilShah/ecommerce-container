import { useEffect, useState, useContext } from "react";
import { TextField, Button, Box } from "@mui/material";
import api from "../../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loadingUser } = useContext(AuthContext);

  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (loadingUser) return;
    if (!user || user.role !== "admin") navigate("/admin/login");
  }, [user, loadingUser, navigate]);

  useEffect(() => {
    api.get(`/customer/products/${id}`).then((res) => {
      const p = res.data;
      setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, });
      setImages(p.images);
    });
  }, [id]);

  if (!form) return <p>Loading...</p>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {
        const res = await api.post("/admin/upload-product-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
        });

        setImages((prev) => [...prev, res.data.url]);

    } catch (error) {
        console.error("Upload failed", error);
    }

    setUploading(false);
  };

  const update = async () => {
    await api.put(`/admin/updateProduct/${id}`, { ...form, price: Number(form.price), stock: Number(form.stock), images: images, });
    navigate("/admin/products");
  };

  const removeImage = (imgUrl) => {
    setImages((prev) => prev.filter((item) => item !== imgUrl));
  };


  return (
    <Box sx={{ maxWidth: 500, mx: "auto" }}>
      <h2>Edit Product</h2>

      <TextField label="Name" name="name" value={form.name} fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Description" name="description" value={form.description} fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Price" name="price" value={form.price} type="number" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Stock" name="stock" value={form.stock} type="number" fullWidth margin="normal" onChange={handleChange} />
      <Box sx={{ my: 2 }}>
        <Button variant="outlined" component="label">
            Upload Image
            <input type="file" hidden onChange={uploadImage} />
        </Button>

        {uploading && <p>Uploading...</p>}

        <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap", }} >
            {images.map((img, i) => (
            <Box key={i} sx={{ position: "relative", display: "inline-block" }}>
                <img src={`${process.env.REACT_APP_IMAGE_URL}${img}`} alt="product_img" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover", border: "1px solid #ccc", }} />

                <span onClick={() => removeImage(img)} style={{ position: "absolute", top: -10, right: -10, background: "#000", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 14, textAlign: "center", cursor: "pointer", lineHeight: "20px", }} >&times;</span>
            </Box>
            ))}
        </Box>
      </Box>

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={update}>
        Update Product
      </Button>
    </Box>
  );
}