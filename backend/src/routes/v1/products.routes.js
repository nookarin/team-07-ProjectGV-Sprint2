import { Router } from "express";
import { Product } from "../../models/product.model.js";
import { Category } from "../../models/category.model.js";

export const productRouter = Router();

// GET / - Fetch all products (User & Admin)
productRouter.get("/", async (req, res) => {
  try {
    const products = await Product.find({ is_active: true }).populate(
      "category_id",
      "category_name",
    );
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("GET /products error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /:id - Get single product by ID
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_id",
      "category_name",
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("GET /products/:id error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST / - Create (save) a new product to store (Admin)
productRouter.post("/", async (req, res) => {
  try {
    const { category, product_name, description, price, stock } = req.body;
    console.log(category.toLowerCase());
    const categoryId = await Category.find({
      category_name: category.toLowerCase(),
    });
    if (!categoryId[0]) {
      const response = await Category.create({
        category_name: category.toLowerCase(),
      });
      const product = await Product.create({
        product_name,
        description,
        price,
        stock,
        category_id: response._id,
        createdAt: new Date(),
      });
      return res.status(201).json({
        success: true,
        message: "Created Product successfully.",
        data: product,
      });
    }

    const product = await Product.create({
      product_name,
      description,
      price,
      stock,
      category_id: categoryId[0]._id,
      createdAt: new Date(),
    });
    return res.status(201).json({
      success: true,
      message: "Created Product successfully.",
      data: product,
    });
  } catch (error) {
    console.error("POST /products error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /:id - Update product within system (Admin)
productRouter.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("PUT /products/:id error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /:id - Remove product from system (Admin)
productRouter.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("DELETE /products/:id error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
