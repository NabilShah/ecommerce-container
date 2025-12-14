import { useState, useContext, useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import api from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", images: "", });
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;
    if (!user || user.role !== "admin") navigate("/admin/login");
  }, [user, loadingUser, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

    const removeImage = (imgUrl) => {
        setImages((prev) => prev.filter((item) => item !== imgUrl));
    };

  const submit = async () => {
    await api.post("/admin/createProduct", {...form, price: Number(form.price), stock: Number(form.stock), images: images,});
    navigate("/admin/products");
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto" }}>
      <h2>Add Product</h2>

      <TextField label="Name" name="name" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Description" name="description" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Price" name="price" type="number" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Stock" name="stock" type="number" fullWidth margin="normal" onChange={handleChange} />

      <Box sx={{ my: 2 }}>
        <Button variant="outlined" component="label">
            Upload Image
            <input type="file" hidden onChange={uploadImage} />
        </Button>

        {uploading && <p>Uploading...</p>}

        <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap", }} >
            {images.map((img, i) => (
            <Box key={i} sx={{ position: "relative", display: "inline-block" }}>
                <img src={`${process.env.REACT_APP_IMAGE_URL}${img}`} alt="product_img" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover", border: "1px solid #ccc", }}
                />

                <span onClick={() => removeImage(img)} style={{ position: "absolute", top: -10, right: -10, background: "#000", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 14, textAlign: "center", cursor: "pointer", lineHeight: "20px", }} >&times;</span>

            </Box>
            ))}
        </Box>
      </Box>

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={submit}>
        Save Product
      </Button>
    </Box>
  );
}