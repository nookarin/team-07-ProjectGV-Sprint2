import { Router } from "express";
import mongoose from "mongoose";
import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";
import { protect } from "../../middlewares/protect.js";
import { authorize } from "../../middlewares/authorize.js";
import { ShoppingCart } from "../../models/cart.model.js";
import { User } from "../../models/user.model.js";

export const orderRouter = Router();

// GET / - Fetch all orders (admin only)
orderRouter.get("/", protect, authorize(["admin"]), async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "username email firstname lastname")
      .populate("items.product_id", "product_name price image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
});

// GET /user/:user_id - Fetch all orders of a specific user (owner or admin)
orderRouter.get("/user/:user_id", protect, async (req, res, next) => {
  try {
    const currentUser = req.user.user;

    const isAdmin = currentUser.role === "admin";
    const isOwner = currentUser._id.toString() === req.params.user_id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    const orders = await Order.find({ user_id: req.params.user_id })
      .populate("items.product_id", "product_name price image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
});

// GET /:id - Get single order by ID (owner or admin)
orderRouter.get("/:id", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    const currentUser = req.user.user;

    const isAdmin = currentUser.role === "admin";
    const isOwner = order.user_id.toString() === currentUser._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    // ตรวจสิทธิ์ก่อน populate
    await order.populate([
      {
        path: "user_id",
        select: "username email firstname lastname",
      },
      {
        path: "items.product_id",
        select: "product_name price image",
      },
    ]);

    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// POST / - Create a new order (User - Checkout)
orderRouter.post("/", protect, async (req, res) => {
  try {
    const { cart_id, payment_method } = req.body ?? {};
    // อ่าน user_id จาก token ที่ user log in เข้าใช้งาน
    const user_id = req.user.user._id;

    if (!cart_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "Cart_id and payment_method are required!",
      });
    }

    // เริ่มทำงานกับฐานข้อมูลแบบ transaction แล้วรอผลลัพธ์มาเก็บในตัวแปร order
    // Transaction คือการรวมหลายขั้นตอนให้เป็นงานชุดเดียว
    const order = await mongoose.connection.transaction(async (session) => {
      // หาตะกร้าที่เป็นของผู้ใช้และยัง active
      const cart = await ShoppingCart.findOne({
        _id: cart_id,
        user_id,
        status: "active",
      }).session(session);

      // กรณีที่ cart ไม่มีตะกร้าที่เป็น active
      if (!cart) {
        return res.status(409).json({
          success: false,
          message: "Cart is unavailable or already checked out!",
        });
      }

      // กรณีที่สินค้าในตะกร้าไม่มีอยู่เลย
      if (cart.items.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Your cart is empty!" });
      }

      // อ่านข้อมูล User ล่าสุดและหา default address
      const user = await User.findById(user_id).session(session);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found!" });
      }

      // กรอง default address
      const defaultAddresses = user.address.filter(
        (address) => address.isDefault === true,
      );

      // ถ้าไม่มี default address เลย
      if (defaultAddresses.length !== 1) {
        return res.status(400).json({
          success: false,
          message: "Please select exactly one default shipping address!",
        });
      }

      // ป้องกันกรณีมี default address หลายอัน ให้เลือกอันแรก
      const address = defaultAddresses[0];

      // ใส่ค่า address ที่ใช้จัดส่งด้วย default address
      const shipping_address = {
        firstname: address.firstname,
        lastname: address.lastname,
        phoneNumber: user.phoneNumber,
        houseNo: address.houseNo,
        street: address.street,
        subdistrict: address.subdistrict,
        district: address.district,
        province: address.province,
        zipCode: address.zipCode,
      };

      // หารายการสินค้าใน cart เก็บไว้ใน productIds
      const productIds = cart.items.map((item) => item.product_id);

      // ค้นหา Product ที่ _id ตรงกับ ID ตัวใดตัวหนึ่งใน productIds
      const products = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      // วนสินค้าใน Cart แล้วหาข้อมูล Product ที่ตรงกัน
      const items = cart.items.map((item) => {
        const product = products.find(
          (product) => product._id.toString() === item.product_id.toString(),
        );

        if (!product) {
          return res.status(409).json({
            success: false,
            message: "Some products are no longer available!",
          });
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          return res.status(400).json({
            success: false,
            message: "Product quantity must be a positive integer!",
          });
        }

        // isFinite เช็กว่าเป็นตัวเลขไหม
        if (!Number.isFinite(product.price) || product.price < 0) {
          return res.status(409).json({
            success: false,
            message: "Some products have an invalid price!",
          });
        }

        return {
          product_id: product._id,
          quantity: item.quantity,
          unit_price: product.price,
        };
      });

      // คำนวณยอดรวมจำนวนสินค้า
      const total_quantity = items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      // คำนวณยอดรวมราคาสินค้าทั้งหมด
      const total_price = items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      );

      // สร้าง Order
      const newOrder = new Order({
        cart_id: cart._id,
        user_id,
        items,
        total_quantity,
        total_price,
        shipping_address,
        payment_method: payment_method.trim(),
        status: "pending",
      });

      await newOrder.save({ session });

      // เปลี่ยนสถานะ Cart ภายใน transaction เดียวกัน
      cart.status = "checked_out";
      await cart.save({ session });

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: "Created order successfully!",
      order,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /:id - Update order status (admin full access; owner can update status only)
orderRouter.put("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body ?? {};

    const validStatuses = [
      "pending",
      "paid",
      "shipped",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status!" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    const currentUser = req.user.user;

    const isAdmin = currentUser.role === "admin";
    const isOwner = order.user_id.toString() === currentUser._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    if (!isAdmin) {
      // ลูกค้าขอยกเลิกได้อย่างเดียว
      if (status !== "cancelled") {
        return res
          .status(403)
          .json({ success: false, message: "You can only cancel your order!" });
      }

      if (order.status !== "pending") {
        return res
          .status(409)
          .json({
            success: false,
            message: "Only pending orders can be cancelled!",
          });
      }
    } else {
      // กติกาตัวอย่างสำหรับ admin
      // COD ส่งของก่อน แล้วจึงยืนยันเก็บเงินตอน completed
      const allowedTransitions =
        order.payment_method === "cod"
          ? {
              pending: ["shipped", "cancelled"],
              paid: ["shipped"],
              shipped: ["completed"],
              completed: [],
              cancelled: [],
            }
          : {
              pending: ["paid", "cancelled"],
              paid: ["shipped"],
              shipped: ["completed"],
              completed: [],
              cancelled: [],
            };

      const allowedStatuses = allowedTransitions[order.status] ?? [];

      if (!allowedStatuses.includes(status)) {
         return res
          .status(409)
          .json({
            success: false,
            message: `Cannot change status from ${order.status} to ${status}.`,
          });
      }

      // ก่อนตั้ง paid:
      // admin ต้องตรวจสอบการชำระเงินจริงก่อน
      // โค้ดนี้ไม่ได้ตรวจสอบกับผู้ให้บริการชำระเงิน
    }

    // ใส่สถานะเดิมในเงื่อนไข
    // ป้องกันการเขียนทับสถานะที่เปลี่ยนไปแล้ว
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: order.status,
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedOrder) {
       return res
          .status(409)
          .json({
            success: false,
            message: "Order status has changed. Please refresh and try again!",
          });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
      updatedOrder,
    });
  } catch (error) {
    next(error)
  }
});

// DELETE /:id - Delete/cancel an order (owner or admin)
orderRouter.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
      success: false,
      message: "Order not found!",
    });
    }

    const currentUser = req.user.user;

    const isAdmin = currentUser.role === "admin";
    const isOwner =
      order.user_id.toString() === currentUser._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
      success: false,
      message:  "Forbidden!",
    });
      
    }

    // ยกเลิกไปแล้ว ตอบกลับข้อมูลเดิม
    if (order.status === "cancelled") {
      return res.status(200).json({
        success: true,
        message: "Order is already cancelled!",
        order,
      });
    }

    if (order.status !== "pending") {
       return res.status(409).json({
        success: false,
        message: "Only pending orders can be cancelled!",
      });
    }

    const cancelledOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: "pending",
      },
      {
        $set: { status: "cancelled" },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!cancelledOrder) {
      return res.status(409).json({
        success: false,
        message: "Order status has changed. Please refresh and try again!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully!",
      cancelledOrder,
    });
  } catch (error) {
    next(error)
  }
});
