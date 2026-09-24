import { Router } from "express";
import crypto from "crypto";
import multer from "multer";
import generatePromptPayPayload from "promptpay-qr";
import qrcode from "qrcode";
import Stripe from "stripe";
import { ShoppingCart } from "../../models/cart.model.js";
import { Order } from "../../models/order.model.js";
import { protect } from "../../middlewares/protect.js";
import { cloudinary } from "../../config/cloudinary.js";

export const paymentRouter = Router();

const uploadSlip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const PAYMENT_METHODS = ["card", "stripe", "bank_transfer", "promptpay"];

// Luhn checksum - the standard check digit algorithm real card numbers pass.
function isValidCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(expiry) {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry || "");
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const expiryDate = new Date(year, month, 1);
  return expiryDate > new Date();
}

function validateCardPayment(card) {
  if (!card) return "Card details are required!";
  if (!isValidCardNumber(card.number || "")) return "Card number is invalid!";
  if (!/^\d{3,4}$/.test(card.cvv || "")) return "CVV is invalid!";
  if (!isValidExpiry(card.expiry)) return "Card expiry date is invalid or expired!";
  if (!card.holderName || !card.holderName.trim()) return "Cardholder name is required!";
  return null;
}

function validateBankPayment(bank) {
  if (!bank) return "Bank account details are required!";
  if (!bank.bankName || !bank.bankName.trim()) return "Bank name is required!";
  if (!/^\d{8,15}$/.test((bank.accountNumber || "").replace(/\s+/g, ""))) {
    return "Bank account number is invalid!";
  }
  if (!bank.accountName || !bank.accountName.trim()) return "Account holder name is required!";
  if (!bank.consent) return "You must authorize automatic debit to continue!";
  return null;
}

// GET /api/v1/payments/promptpay-qr
// Returns a real dynamic PromptPay EMVCo QR Code based on active cart total
paymentRouter.get("/promptpay-qr", protect, async (req, res, next) => {
  try {
    const userId = req.user.user._id;
    const cart = await ShoppingCart.findOne({
      user_id: userId,
      status: "active",
    }).populate("items.product_id");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty!",
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product_id.price * item.quantity,
      0,
    );
    const shipping = 10;
    const grandTotalUSD = subtotal + shipping;
    // Exchange rate conversion: 1 USD = 35 THB
    const amountTHB = Number((grandTotalUSD * 35).toFixed(2));

    const promptpayNumber = process.env.PROMPTPAY_NUMBER || "0812345678";
    const promptpayName = process.env.PROMPTPAY_NAME || "GearVerse Official Store";

    const payload = generatePromptPayPayload(promptpayNumber, { amount: amountTHB });
    const qrCodeDataUrl = await qrcode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        amountTHB,
        grandTotalUSD,
        promptpayNumber,
        promptpayName,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/checkout
// Charges the caller's active cart and turns it into a paid Order.
paymentRouter.post(
  "/checkout",
  protect,
  uploadSlip.single("slip"),
  async (req, res, next) => {
    try {
      const userId = req.user.user._id;

      // Parse fields (supports both application/json and multipart/form-data)
      let shipping_address = req.body.shipping_address;
      if (typeof shipping_address === "string") {
        try {
          shipping_address = JSON.parse(shipping_address);
        } catch {
          // keep as string
        }
      }

      let card = req.body.card;
      if (typeof card === "string") {
        try {
          card = JSON.parse(card);
        } catch {}
      }

      let bank = req.body.bank;
      if (typeof bank === "string") {
        try {
          bank = JSON.parse(bank);
        } catch {}
      }

      const payment_method = req.body.payment_method;

      let normalizedAddress;
      if (typeof shipping_address === "string") {
        if (!shipping_address.trim()) {
          return res.status(400).json({
            success: false,
            message: "Shipping address is required!",
          });
        }
        normalizedAddress = {
          firstname: req.user.user?.firstname || "Customer",
          lastname: req.user.user?.lastname || "",
          phoneNumber: String(req.user.user?.phoneNumber || "0000000000"),
          houseNo: shipping_address.trim(),
          street: "",
          subdistrict: "-",
          district: "-",
          province: "-",
          zipCode: "00000",
        };
      } else if (typeof shipping_address === "object" && shipping_address !== null) {
        if (
          !shipping_address.firstname?.trim() ||
          !shipping_address.phoneNumber?.trim() ||
          !shipping_address.houseNo?.trim() ||
          !shipping_address.province?.trim() ||
          !shipping_address.zipCode
        ) {
          return res.status(400).json({
            success: false,
            message: "Please fill in all required shipping address fields!",
          });
        }
        normalizedAddress = {
          firstname: shipping_address.firstname.trim(),
          lastname: (shipping_address.lastname || "").trim(),
          phoneNumber: String(shipping_address.phoneNumber).trim(),
          houseNo: shipping_address.houseNo.trim(),
          street: (shipping_address.street || "").trim(),
          subdistrict: (shipping_address.subdistrict || "-").trim(),
          district: (shipping_address.district || "-").trim(),
          province: shipping_address.province.trim(),
          zipCode: String(shipping_address.zipCode).trim(),
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Shipping address is required!",
        });
      }

      if (!PAYMENT_METHODS.includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: "Unsupported payment method!",
        });
      }

      const cart = await ShoppingCart.findOne({
        user_id: userId,
        status: "active",
      }).populate("items.product_id");

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Your cart is empty!",
        });
      }

      let paymentResult = {
        approved: true,
        id: `pay_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`,
      };

      let slip_url = "";
      let slip_public_id = "";

      // 1. PromptPay Handling
      if (payment_method === "promptpay") {
        if (req.file) {
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "gearverse/slips", resource_type: "image" },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              },
            );
            stream.end(req.file.buffer);
          });
          slip_url = uploadResult.secure_url;
          slip_public_id = uploadResult.public_id;
        }
      }
      // 2. Stripe Handling
      else if (payment_method === "stripe") {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const isRealStripeKey =
          stripeKey &&
          stripeKey.startsWith("sk_") &&
          !stripeKey.includes("placeholder");

        if (isRealStripeKey) {
          try {
            const stripe = new Stripe(stripeKey);
            // Real Stripe test charge or payment intent
            const charge = await stripe.charges.create({
              amount: Math.round(
                (cart.items.reduce(
                  (sum, item) => sum + item.product_id.price * item.quantity,
                  0,
                ) + 10) * 100,
              ), // cents
              currency: "usd",
              source: "tok_visa", // Default test token for demo
              description: `GearVerse Order for ${req.user.user?.email || "customer"}`,
            });
            paymentResult = { approved: true, id: charge.id };
          } catch (stripeErr) {
            return res.status(402).json({
              success: false,
              message: stripeErr.message || "Stripe payment failed.",
            });
          }
        } else {
          // Simulated Stripe checkout validation
          const err = validateCardPayment(card);
          if (err) {
            return res.status(402).json({ success: false, message: err });
          }
        }
      }
      // 3. Bank Auto-Debit Handling
      else if (payment_method === "bank_transfer") {
        const err = validateBankPayment(bank);
        if (err) {
          return res.status(402).json({ success: false, message: err });
        }
      }
      // 4. Standard Card Handling
      else if (payment_method === "card") {
        const err = validateCardPayment(card);
        if (err) {
          return res.status(402).json({ success: false, message: err });
        }
      }

      const orderItems = cart.items.map((item) => ({
        product_id: item.product_id._id,
        quantity: item.quantity,
        unit_price: item.product_id.price * item.quantity,
      }));
      const total_quantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const total_price = orderItems.reduce((sum, item) => sum + item.unit_price, 0);

      const methodLabel =
        payment_method === "promptpay"
          ? "PromptPay"
          : payment_method === "card"
            ? "Credit/Debit Card"
            : payment_method === "stripe"
              ? "Stripe"
              : "Bank Auto-Debit";

      const order = await Order.create({
        user_id: userId,
        cart_id: cart._id,
        items: orderItems,
        total_quantity,
        total_price,
        status: "paid",
        shipping_address: normalizedAddress,
        payment_method: methodLabel,
        slip_url,
        slip_public_id,
      });

      // Clear the cart on payment success
      cart.items = [];
      await cart.save();

      return res.status(201).json({
        success: true,
        data: {
          order,
          payment: {
            id: paymentResult.id,
            status: "succeeded",
            method: methodLabel,
            slip_url,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
