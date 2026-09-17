import { Router } from "express";
import { Subcategory } from "../../models/subcategory.model.js";

export const subcategoryRouter = Router();

// GET all subcategories
subcategoryRouter.get("/", async (req, res, next) => {
  try {
    const subcategories = await Subcategory.find().populate("category_ids");
    if (subcategories.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Subcategories's data is empty!" });
    }
    return res.status(200).json({
      success: true,
      count: subcategories.length,
      subcategories,
    });
  } catch (error) {
    next(error);
  }
});

// GET subcategory by id
subcategoryRouter.get("/:id", async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category_ids",
    );
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found!" });
    }
    return res.status(200).json({ success: true, subcategory });
  } catch (error) {
    next(error);
  }
});

// POST subcategory
subcategoryRouter.post("/", async (req, res, next) => {
  try {
    const { subcategory_name, category_ids } = req.body;
    const subcategory = await Subcategory.create({
      subcategory_name,
      category_ids,
    });
    if (!subcategory) {
      return res
        .status(400)
        .json({ success: false, message: "Can not create subcategory!" });
    }
    return res.status(201).json({
      success: true,
      message: "created subcategory successfully",
      subcategory,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH subcategory
subcategoryRouter.patch("/:id", async (req, res, next) => {
  try {
    const { subcategory_name, category_ids } = req.body;

    const updateFields = {};
    if (subcategory_name) {
      updateFields.subcategory_name = subcategory_name;
    }
    if (category_ids) {
      updateFields.category_ids = category_ids;
    }
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update!",
      });
    }
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true },
    );
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found!" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Updated subcategory partially!", subcategory });
  } catch (error) {
    next(error);
  }
});

// DELETE subcategory
subcategoryRouter.delete("/:id", async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found!" });
    }
    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
      subcategory,
    });
  } catch (error) {
    next(error);
  }
});
