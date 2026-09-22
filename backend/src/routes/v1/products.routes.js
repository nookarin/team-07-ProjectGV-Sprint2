import { Router } from "express";
import multer from "multer";
import { Product } from "../../models/product.model.js";
import { Subcategory } from "../../models/subcategory.model.js";
import { Category } from "../../models/category.model.js";
import { cloudinary } from "../../config/cloudinary.js";
import { protect } from "../../middlewares/protect.js";
import { authorize } from "../../middlewares/authorize.js";

export const productRouter = Router();

// middleware ของ express สำหรับรับไฟล์รูปภาพจาก req
const uploadImages = multer({
  // multer.memoryStorage เป็นการบอกว่าให้เก็บไฟล์จาก req ไว้บน memory ของ server ก่อน
  // multer จะอ่านไฟล์แล้วเก็บข้อมูลไฟล์ไว้ใน RAM เป็น Buffer
  storage: multer.memoryStorage(),
  // รับได้สูงสุดไฟล์ละ 5 MB 10 ไฟล์
  // 1 MB = 1024 * 1024
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array("images", 10);

// GET all peoducts

productRouter.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().populate(
      "category_id subcategory_ids",
    );

    console.log(products)
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

productRouter.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params
    const product = await Product.findById(productId).populate(
      "category_id subcategory_ids",
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error)
  }
})


productRouter.get("/:category", async (req, res, next) => {
  try {
    const { category } = req.params;
    const { name } = req.query;
    const filter = {};
    console.log(name);
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
      filter.product_name = { $regex: name ?? "", $options: "i" };
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


productRouter.get('/:category/:product', async (req, res, next) => {
  try {
    const { category, product } = req.params
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// POST product (admin only)
productRouter.post("/", protect, authorize(["admin"]), async (req, res, next) => {
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

    // หากมี subcategory_ids ส่งมา ให้เก็บ subcategories เอาไว้ในตัวแปร subcategories จากการ find หาใน Subcategory
    if (subcategory_ids) {
      const subcategories = await Subcategory.find({
        _id: { $in: subcategory_ids },
        // กำหนดว่า subcategory ที่ส่งมาต้องตรงกับที่ผูกไว้กับ category ด้วย
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

    // Return the product with subcategory_ids populated so the created doc can
    // be mapped straight back to tag names by the frontend's fromDoc.
    const populatedProduct = await Product.findById(product._id).populate(
      "category_id subcategory_ids",
    );

    return res.status(201).json({
      success: true,
      message: "Created Product successfully!",
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

// POST /:id/images - Upload product images to Cloudinary and link them to the product.
// The first uploaded image becomes the main product picture. (admin only)
productRouter.post("/:id/images", protect, authorize(["admin"]), uploadImages, async (req, res, next) => {
  try {
    // uploadImages กับ req.files คืออันเดียวกัน
    // ตรวจสอบว่ามีรูปภาพจาก req ถูกส่งเข้ามาหรือไม่
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image files provided!" });
    }

    // ตรวจสอบว่าในไฟล์ config มี cloud name ที่ใช้งานหรือไม่
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary is not configured on the server!",
      });
    }

    // ค้นหา product id เพื่อจะอัปโหลดรูปภาพลง
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const uploadedUrls = [];
    // ลูปเพื่อดึงข้อมูลรูปภาพจาก req ที่ส่งเข้ามาเป็น array ทีละไฟล์
    for (const file of req.files) {
      // สร้าง promise รอ cloudinary
      const upload = await new Promise((resolve, reject) => {
        // cloudinary.uploader.upload_stream ทำงานแบบ callback จึงต้องใส่ await ไว้
        // สร้าง stream สำหรับรับข้อมูลรูปภาพ
        const stream = cloudinary.uploader.upload_stream(
          // ให้เก็บรูปไว้ในโฟลเดอร์ gearverse/products บน Cloudinary และบอกว่า ไฟล์ที่กำลังอัปโหลดเป็นรูปภาพ
          { folder: "gearverse/products", resource_type: "image" },
          // ถ้า upload ไม่สำเร็จ ทำให้ Promise ล้มเหลว และ await จะโยน error ออกมา แต่ถ้า upload สำเร็จ จะมีข้อมูลเกี่ยวกับรูป เช่น URL, public ID ฯลฯ
          (error, result) => (error ? reject(error) : resolve(result)),
        );
        // ส่งข้อมูลรูปเข้า stream 
        stream.end(file.buffer);
      });
      // เก็บ URL ของรูปไว้ใน uploadedUrls
      // secure_url ไม่ใช่ตัวแปรที่เราสร้างเอง แต่เป็น property ของ object result ที่ Cloudinary ส่งกลับมาให้ หลังอัปโหลดรูปสำเร็จ
      uploadedUrls.push(upload.secure_url);
    }

    // เอา url ทั้งหมดไปเก็บไว้ใน array images ที่อยู่ใน product
    product.images = uploadedUrls;
    product.image_url = uploadedUrls[0];
    // บันทึกข้อมูล url ลง product
    await product.save();

    // Return with subcategory_ids populated (this doc also gets mapped by fromDoc).
    const populatedProduct = await Product.findById(product._id).populate(
      "category_id subcategory_ids",
    );

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully!",
      images: product.images,
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /:id - Update product within system (admin only)
productRouter.put("/:id", protect, authorize(["admin"]), async (req, res, next) => {
  try {
    const { subcategory_ids } = req.body;

    // Keep the same guarantee as POST: every subcategory must actually
    // belong to the product's category (tags = subcategories).
    if (subcategory_ids) {
      const subcategories = await Subcategory.find({
        _id: { $in: subcategory_ids },
        category_ids: req.body.category_id,
      });

      if (subcategories.length !== subcategory_ids.length) {
        return res.status(400).json({
          success: false,
          message: "Some subcategories do not belong to this category!",
        });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Return with subcategory_ids populated so tag names come back too.
    const populatedProduct = await Product.findById(product._id).populate(
      "category_id subcategory_ids",
    );

    return res.status(200).json({ success: true, data: populatedProduct });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - Remove product from system (admin only)
productRouter.delete("/:id", protect, authorize(["admin"]), async (req, res, next) => {
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
