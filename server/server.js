import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/", async (req, res) => {
  res.send("Hello from Product Management Server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
