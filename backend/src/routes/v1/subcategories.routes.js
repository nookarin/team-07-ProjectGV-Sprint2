import { Router } from "express";
import { Subcategory } from "../../models/subcategory.model.js";
import { Category } from "../../models/category.model.js";
import { Product } from "../../models/product.model.js";

export const subcategoryRouter = Router();

// GET all subcategories
subcategoryRouter.get("/", async (req, res, next) => {
  try {
    const { category_id } = req.query;

    const filter = {};

    // filter
    // ถ้ามี category_id ให้ค้นหาเฉพาะ subcategory ที่มี category_id นี้อยู่ใน category_ids
    if (category_id) {
      filter.category_ids = category_id;
    }

    const subcategories =
      await Subcategory.find(filter).populate("category_ids");

    if (subcategories.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Subcategory's data is empty!",
      });
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

    if (
      !subcategory_name ||
      !Array.isArray(category_ids) || // เช็กว่าไม่ใช่ array เพราะเรากำหนดใน schema ให้รับเป็น array
      category_ids.length === 0 // เป็น array จริง แต่ไม่มีข้อมูล []
    ) {
      return res.status(400).json({
        success: false,
        message: "Subcategory's name and category id are required!",
      });
    }

    //ใช้เพื่อค้นหาว่า subcategory ที่เรากำลังจะสร้าง มี category ที่เราใส่ id ไว้เพื่อจะสร้างหรือไม่
    // $in คือหา Category ที่ _id ตรงกับค่าใดค่าหนึ่งใน category_ids ที่ส่งมา
    const categories = await Category.find({
      _id: { $in: category_ids },
    });

    // หากจำนวน category ที่พบไม่เท่ากับ category_ids ที่ส่งมา แสดงว่ามีบาง category ที่ไม่มีอยู่ใน database
    if (categories.length !== category_ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some categories do not exist!",
      });
    }

    const subcategory = await Subcategory.create({
      subcategory_name,
      category_ids,
    });

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
    if (subcategory_name !== undefined) {
      updateFields.subcategory_name = subcategory_name;
    }

    if (category_ids !== undefined) {
      updateFields.category_ids = category_ids;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update!",
      });
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true },
    );

    if (!updatedSubcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Updated subcategory partially!",
      updatedSubcategory,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE subcategory
subcategoryRouter.delete("/:id", async (req, res, next) => {
  try {
    // เช็กว่ามี Product อย่างน้อย 1 ตัว ผูกกับ Subcategory นี้หรือไม่
    const productExists = await Product.exists({
      subcategory_id: req.params.id,
    });

    if (productExists) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete subcategory because it is being used by products!",
      });
    }

    const deletedSubcategory = await Subcategory.findByIdAndDelete(
      req.params.id,
    );

    if (!deletedSubcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
      deletedSubcategory,
    });
  } catch (error) {
    next(error);
  }
});
