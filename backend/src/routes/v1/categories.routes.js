import { Router } from "express";
import { Category } from "../../models/category.model.js";

export const categoryRouter = Router();

// GET / - Fetch all categories (Admin & User)
categoryRouter.get("/", async (req, res, next) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error)
    }
});

// GET /:id - Get single category by ID
categoryRouter.get("/:id", async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        return res.status(200).json({ success: true, data: category });
    } catch (error) {
       next(error)
    }
});

// POST / - Create a new category (Admin)
categoryRouter.post("/", async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return res.status(201).json({ success: true, data: category });
    } catch (error) {
       next(error)
    }
});

// PUT /:id - Update category within system (Admin)
categoryRouter.put("/:id", async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        return res.status(200).json({ success: true, data: category });
    } catch (error) {
        next(error)
    }
});

// DELETE /:id - Remove category from system (Admin)
categoryRouter.delete("/:id", async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        return res.status(200).json({ success: true, message: "Category deleted successfully", data: category });
    } catch (error) {
       next(error)
    }
});
