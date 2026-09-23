import { Router } from "express";
import { Wishlist } from "../../models/wishlist.model.js";
import { protect } from "../../middlewares/protect.js";
import { authorize } from "../../middlewares/authorize.js";

export const wishlistRouter = Router();

// GET / - Fetch all wishlists (admin only)
wishlistRouter.get("/", protect, async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({}).populate("user products");
    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
});

// POST / - Add a product to the current user's wishlist
wishlistRouter.post("/", protect, async (req, res, next) => {
  try {
    const { product } = req.body;
    const user = req.user.user._id;
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product is required!" });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: user },
      { $addToSet: { products: product } },
      { new: true, upsert: true },
    );

    if (!wishlist) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to save wishlist!" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Created wishlist successfully" });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - Remove a product from the current user's wishlist
wishlistRouter.delete("/:id", protect, async (req, res, next) => {
  try {
    const user = req.user.user._id;

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: user },
      { $pull: { products: req.params.id } },
      { new: true },
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