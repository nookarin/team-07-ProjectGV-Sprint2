import { Router } from "express";
import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";
import { protect } from "../../middlewares/protect.js";
import { authorize } from "../../middlewares/authorize.js";

export const orderRouter = Router();

// GET / - Fetch all orders (admin only)
orderRouter.get("/", protect, authorize(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "username email firstname lastname")
      .populate("items.product_id", "product_name price image");
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("GET /orders error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /user/:user_id - Fetch all orders of a specific user (owner or admin)
orderRouter.get("/user/:user_id", protect, async (req, res) => {
  try {
    const currentUser = req.user.user;
    if (
      currentUser.role !== "admin" &&
      currentUser._id.toString() !== req.params.user_id
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const orders = await Order.find({ user_id: req.params.user_id })
      .populate("items.product_id", "product_name price image")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("GET /orders/user/:user_id error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /:id - Get single order by ID (owner or admin)
orderRouter.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "username email firstname lastname")
      .populate("items.product_id", "product_name price image");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    const currentUser = req.user.user;
    if (
      currentUser.role !== "admin" &&
      order.user_id?._id.toString() !== currentUser._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("GET /orders/:id error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST / - Create a new order (User - Checkout)
orderRouter.post("/", protect, async (req, res) => {
  try {
    const { items, shipping_address, payment_method } = req.body;

    const user_id = req.user.user._id;

    const productIds = items.map((item) => item.product_id);
    const response = await Product.find({ _id: { $in: productIds } });

    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < response.length; j++) {
        if (response[j]._id == items[i].product_id) {
          items[i].unit_price = response[j].price * items[i].quantity;
        }
      }
    }

    // Calculate total_price and total_quantity from items
    const total_quantity = await items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const total_price = await items.reduce(
      (sum, item) => sum + item.unit_price,
      0,
    );

    const order = await Order.create({
      user_id,
      items,
      total_quantity,
      total_price,
      shipping_address,
      payment_method,
    });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("POST /orders error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /:id - Update order status (admin full access; owner can update status only)
orderRouter.put("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isOwner = order.user_id.toString() === currentUser._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updateBody = isAdmin ? req.body : { status: req.body.status };

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateBody, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("PUT /orders/:id error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /:id - Delete/cancel an order (owner or admin)
orderRouter.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isOwner = order.user_id.toString() === currentUser._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await Order.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
    console.error("DELETE /orders/:id error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// "product_id": "6aa7de7729b84330cde14caa",
//         "quantity": 5
//     },{
//         "product_id": "6aa7ddb429b84330cde14ca8",
//         "quantity": 2
//         },
//         {
//             "product_id": "6aa29b160d73bb48cdf90816",
//             "quantity": 4
//         }
