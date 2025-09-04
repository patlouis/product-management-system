import express from "express";
import { connectToDatabase } from "../lib/database.js";

const router = express.Router();

// Get all products with category name
router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [products] = await db.query(`
      SELECT p.product_id, p.name, p.description, p.price, 
             p.category_id, p.created_at, p.updated_at,
             c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.name ASC;
    `);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
router.post("/", async (req, res) => {
  const { name, description, category_id, price } = req.body;
  if (!name || !description || !category_id || price == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "INSERT INTO products (name, description, category_id, price) VALUES (?, ?, ?, ?)",
      [name, description, Number(category_id), Number(price)]
    );

    res.status(201).json({
      product_id: result.insertId,
      name,
      description,
      category_id,
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
  const { name, description, category_id, price } = req.body;

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "UPDATE products SET name = ?, description = ?, category_id = ?, price = ?, updated_at = NOW() WHERE product_id = ?",
      [name, description, category_id, price, id]
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
