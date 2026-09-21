import { Router } from "express";
import multer from "multer";
import { Product } from "../../models/product.model.js";
import { Subcategory } from "../../models/subcategory.model.js";
import { Category } from "../../models/category.model.js";
import { cloudinary } from "../../config/cloudinary.js";

export const productRouter = Router();

const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array("images", 10);

// GET all peoducts
productRouter.get("/:category", async (req, res, next) => {
  try {
    const { category } = req.params;
    const { name } = req.query
    const filter = {};

    if (category) {
      const categoryData = await Category.findOne({
        category_name: category,
      });

      if (!categoryData) {
        return res.status(404).json({
          success: false,
          message: "Category not found!",
        });
      }
      console.log(categoryData)
      // แปลงจาก category name ที่ใช้ query เป็น id เนื่องจากตอนส่ง req body มีแค่ category_id
      // ไม่ใช้ populate เพราะ product ที่ไม่ได้ query จะถูกส่งมาด้วย แต่ category จะเป็น null ในขณะที่ product ที่ query มาจะมีชื่อ category มาด้วยไม่เป็นค่า null
      filter.category_id = categoryData._id;
    }

    const products = await Product.find(filter).populate(
      "category_id subcategory_ids",
    );

    if (products.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Product's data is empty!",
      });
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
});


// GET product by id
productRouter.get("/:category", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_id subcategory_ids",
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

productRouter.get("/", async (req, res, next) => {
  try {
    const { category } = req.query;

    const filter = {};

    if (category) {
      const categoryData = await Category.findOne({
        category_name: category,
      });

      if (!categoryData) {
        return res.status(404).json({
          success: false,
          message: "Category not found!",
        });
      }

      // แปลงจาก category name ที่ใช้ query เป็น id เนื่องจากตอนส่ง req body มีแค่ category_id
      // ไม่ใช้ populate เพราะ product ที่ไม่ได้ query จะถูกส่งมาด้วย แต่ category จะเป็น null ในขณะที่ product ที่ query มาจะมีชื่อ category มาด้วยไม่เป็นค่า null
      filter.category_id = categoryData._id;
    }

    const products = await Product.find(filter).populate(
      "category_id subcategory_ids",
    );

    if (products.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Product's data is empty!",
      });
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
});

// POST product
productRouter.post("/", async (req, res, next) => {
  try {
    const {
      product_name,
      description,
      price,
      stock,
      category_id,
      subcategory_ids,
      weight,
      image_url,
    } = req.body;

    if (
      !product_name ||
      !description ||
      price === null ||
      stock === null ||
      !category_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product's name, description, price, stock and category_id are required!",
      });
    }

    // หากมี subcategory_ids ส่งมา
    if (subcategory_ids) {
      const subcategories = await Subcategory.find({
        _id: { $in: subcategory_ids },
        category_ids: category_id,
      });

      // หากมี subcategory ใดไม่อยู่ใน category ที่เลือก
      if (subcategories.length !== subcategory_ids.length) {
        return res.status(400).json({
          success: false,
          message: "Some subcategories do not belong to this category!",
        });
      }
    }

    const product = await Product.create({
      product_name,
      description,
      price,
      stock,
      category_id,
      subcategory_ids,
      weight,
      image_url,
    });

    return res.status(201).json({
      success: true,
      message: "Created Product successfully!",
      product,
    });
  } catch (error) {
    next(error);
  }
});

// POST /:id/images - Upload product images to Cloudinary and link them to the product.
// The first uploaded image becomes the main product picture.
productRouter.post("/:id/images", uploadImages, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image files provided!" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary is not configured on the server!",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const uploadedUrls = [];
    for (const file of req.files) {
      const upload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "gearverse/products", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result)),
        );
        stream.end(file.buffer);
      });
      uploadedUrls.push(upload.secure_url);
    }

    product.images = uploadedUrls;
    product.image_url = uploadedUrls[0];
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully!",
      images: product.images,
      product,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /:id - Update product within system (Admin)
productRouter.put("/:id", async (req, res, next) => {
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
    next(error);
  }
});

// DELETE /:id - Remove product from system (Admin)
productRouter.delete("/:id", async (req, res, next) => {
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
    next(error);
  }
});
