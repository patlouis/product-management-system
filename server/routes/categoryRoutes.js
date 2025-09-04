import express from "express";
import { connectToDatabase } from "../lib/database.js";

const router = express.Router();

// Get all categories with product count
router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [categories] = await db.query(`
    SELECT c.category_id, c.name, c.created_at, c.updated_at,
          COUNT(p.product_id) AS products
    FROM categories c
    LEFT JOIN products p ON c.category_id = p.category_id
    GROUP BY c.category_id
    ORDER BY c.name ASC;
    `);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );

    res.status(201).json({
      category_id: result.insertId,
      name,
      created_at: new Date(),
      updated_at: new Date(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "UPDATE categories SET name = ?, updated_at = NOW() WHERE category_id = ?",
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();
    const [result] = await db.query(
      "DELETE FROM categories WHERE category_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
