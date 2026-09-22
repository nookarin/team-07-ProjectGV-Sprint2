import { Router } from "express";
import { Wishlist } from "../../models/wishlist.model.js";

export const wishlistRouter = Router();

wishlistRouter.get("/", async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({}).populate("user products");
    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.post("/", async (req, res, next) => {
  try {
    const { user, product } = req.body;
    if (!user || !product) {
      return res
        .status(400)
        .json({ success: false, message: "User and product are required!" });
    }

    // ค้นหา Wishlist ของ user คนนี้
    // - ถ้ามีอยู่แล้ว: $addToSet จะเพิ่ม product เข้าไปใน array 'products' (และจะไม่เพิ่มซ้ำถ้ามีอยู่แล้ว)
    // - ถ้ายังไม่มี: upsert: true จะสร้าง document ของ Wishlist ให้ใหม่
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: user },
      { $addToSet: { products: product } },
      { new: true, upsert: true },
    );

    if (!wishlist) {
      return res
        .status(400)
        .json({ success: false, message: "User and product are required!" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Created wishlist successfully" });
  } catch (error) {
    // E11000 is Mongo's duplicate key error. It normally comes from the stale
    // `user_id` unique index (see dropStaleWishlistIndexes in index.js); surface
    // a readable message to the client instead of a raw server crash.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This product is already in the wishlist or the stale index is blocking the write.",
      });
    }
    next(error);
  }
});

wishlistRouter.delete("/:id", async (req, res, next) => {
  try {
    const { user } = req.body; // หรือดึง userId จาก req.user (ถ้ามี auth middleware)

    // ค้นหา Wishlist ของ user แล้วใช้ $pull ดึง productId นั้นออกจาก array 'products'
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: user },
      { $pull: { products: req.params.id } },
      { new: true } // คืนค่า wishlist อัปเดตล่าสุดกลับมา
    );

    if (!updatedWishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: updatedWishlist,
    });
  } catch (error) {
    next(error);
  }
});
