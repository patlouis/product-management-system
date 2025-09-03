import express from "express";
import { connectToDatabase } from "../lib/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name, description, category, price } = req.body;
  if (!name || !description || category === null || price === null) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "INSERT INTO products (name, description, category, price) VALUES (?, ?, ?, ?)",
      [name, description, category, price]
    );
    res.status(201).json({ message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
