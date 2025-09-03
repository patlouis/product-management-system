import express from "express";
import { connectToDatabase } from "../lib/database.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [products] = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
router.post("/", async (req, res) => {
  const { name, description, category, price } = req.body;
  if (!name || !description || category == null || price == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "INSERT INTO products (name, description, category, price) VALUES (?, ?, ?, ?)",
      [name, description, category, price]
    );

    res.status(201).json({
      product_id: result.insertId,
      name,
      description,
      category,
      price,
      created_at: new Date(),
      updated_at: new Date(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price } = req.body;

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "UPDATE products SET name = ?, description = ?, category = ?, price = ?, updated_at = NOW() WHERE product_id = ?",
      [name, description, category, price, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "DELETE FROM products WHERE product_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
