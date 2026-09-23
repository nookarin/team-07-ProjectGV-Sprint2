import { Router } from "express";
import { ShoppingCart } from "../../models/cart.model.js";
import { Product } from "../../models/product.model.js";

export const shoppingCartRouter = Router();

// GET /api/v1/shoppingcart/:userId - Get active cart for a user
shoppingCartRouter.get("/:userId", async (req, res, next) => {
  try {
    const cart = await ShoppingCart.findOne({
      user_id: req.params.userId,
      status: "active",
    }).populate("user_id items.product_id");

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        message: "No items have been added to the cart yet.",
        cart: cart ?? null,
      });
    }

    return res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/shoppingcart/:userId/items/:itemId
shoppingCartRouter.patch("/:userId/items/:itemId", async (req, res, next) => {
  try {
    console.log(req.body)
    const { quantity } = req.body;

    if (!Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number!",
      });
    }

    const cart = await ShoppingCart.findOne({
      user_id: req.params.userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const item = cart.items.find(
      (item) => item._id.toString() === req.params.itemId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found!",
      });
    }

    // หา product จริงจาก product_id ใน cart item
    const product = await Product.findById(item.product_id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // เช็กว่า quantity ที่ต้องการแก้เกิน stock หรือไม่
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Quantity exceeds available stock!",
      });
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate("items.product_id");

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/shoppingcart/:userId/items
shoppingCartRouter.post("/:userId/items", async (req, res, next) => {
  try {
    console.log(req.body)
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product id is required!",
      });
    }

    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer!",
      });
    }

    // เช็กว่าสินค้ามีอยู่จริง
    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const quantityToAdd = quantity ?? 1;

    // หา active cart
    let cart = await ShoppingCart.findOne({
      user_id: req.params.userId,
      status: "active",
    });

    // ถ้ายังไม่มี cart
    if (!cart) {
      if (quantityToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Quantity exceeds available stock!",
        });
      }

      cart = await ShoppingCart.create({
        user_id: req.params.userId,
        items: [
          {
            product_id,
            quantity: quantityToAdd,
          },
        ],
      });
    } else {
      // เช็กว่าสินค้านี้มีอยู่ใน cart หรือยัง
      const existingIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === product_id
      );

      if (existingIndex >= 0) {
        // จำนวนเดิม + จำนวนที่กำลังจะเพิ่ม
        const newQuantity =
          cart.items[existingIndex].quantity + quantityToAdd;

        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: "Quantity exceeds available stock!",
          });
        }

        cart.items[existingIndex].quantity = newQuantity;
      } else {
        // ยังไม่มีสินค้านี้ใน cart
        if (quantityToAdd > product.stock) {
          return res.status(400).json({
            success: false,
            message: "Quantity exceeds available stock!",
          });
        }

        cart.items.push({
          product_id,
          quantity: quantityToAdd,
        });
      }

      await cart.save();

      await cart.populate("items.product_id");
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
});

// DELETE /api/v1/shoppingcart/:userId/items/:itemId - Remove an item from cart
shoppingCartRouter.delete("/:userId/items/:itemId", async (req, res, next) => {
  try {
    const cart = await ShoppingCart.findOne({
      user_id: req.params.userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // เช็กว่า items ที่จะลบมีอยู่จริงไหม
    // .some() ใช้เช็กว่า ใน array มีอย่างน้อย 1 ตัวที่ตรงกับเงื่อนไขหรือไม่ จะคืนค่าเป็น true หรือ false
    const itemExists = cart.items.some(
      (item) => item._id.toString() === req.params.itemId,
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found!",
      });
    }

    // เก็บทุก item ที่ _id ไม่ตรงกับ itemId ที่ต้องการลบ ดังนั้น item ที่ตรงกันจะถูกตัดออกจาก array
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId,
    );

    await cart.save();

    await cart.populate("items.product_id");

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/shoppingcart/:userId
shoppingCartRouter.delete("/:userId", async (req, res, next) => {
  try {
    const cart = await ShoppingCart.findOne({
      user_id: req.params.userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // ล้างสินค้าทั้งหมดในตะกร้า
    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully!",
      cart,
    });
  } catch (error) {
    next(error);
  }
});
