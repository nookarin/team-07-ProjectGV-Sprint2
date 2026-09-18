import { Router } from "express";
import { Category } from "../../models/category.model.js";
import { Product } from "../../models/product.model.js";

export const categoryRouter = Router();

// GET / - Fetch all categories (Admin & User)
categoryRouter.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find();

    if (categories.length === 0) {
      return res
        .status(200)
        .json({
          success: false,
          message: "Category's data is empty!",
          categories,
        });
    }

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
});

// GET /:id - Get single category by ID
categoryRouter.get("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

// POST / - Create a new category (Admin)
categoryRouter.post("/", async (req, res, next) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required!" });
    }

    const category = await Category.create({
      category_name,
    });

    return res.status(201).json({
      success: true,
      message: "Create category successfully!",
      category,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /:id - Update category within system (Admin)
categoryRouter.put("/:id", async (req, res, next) => {
  try {
    const { category_name } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { category_name },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found!",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - Remove category from system (Admin)
categoryRouter.delete("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found!",
      });
    }

    // เช็กว่ามี product ตัวไหนใช้ category id นี้อยู่มั้ย  | countDocuments เป็นคำสั่งนับจำนวน document
    const productCount = await Product.countDocuments({
      category_id: req.params.id,
    });

    // หากยังมี product ที่ใช้ category id นี้อยู่ จะไม่ให้ลบ category id นี้ออก
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete category because it is still used by products.",
        product_count: productCount,
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      deletedCategory,
    });
  } catch (error) {
    next(error);
  }
});
