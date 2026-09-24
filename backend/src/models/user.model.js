import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    password: { type: String, required: true, select: false },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format!"],
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      set: (v) => (typeof v === "string" ? v.replace(/\s+/g, "") : v),
      default: function () {
        if (this.email && this.email.includes("@")) {
          return this.email.split("@")[0]; // แยก email ด้วย @ และเอาข้อควาหน้า @ หรือ index 0 มาเป็น username
        }
        return "";
      },
    },
    firstname: { type: String },
    lastname: { type: String },
    phoneNumber: { type: Number },
    // Avatar image: stores the Cloudinary secure URL of the uploaded profile picture.
    avatar: { type: String, default: "" },
    // Stores the Cloudinary public_id of the avatar so it can be deleted later.
    avatar_public_id: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    address: {
      type: [
        {
          firstname: { type: String, trim: true },
          lastname: { type: String, trim: true },
          houseNo: { type: String, trim: true },
          street: { type: String, trim: true },
          subdistrict: { type: String, trim: true },
          district: { type: String, trim: true },
          province: { type: String, trim: true },
          zipCode: { type: Number, trim: true },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [{}], // <--- ใส่ [{}] เพื่อสั่งให้สร้าง Object เปล่า 1 ตัวลง Array ( Mongoose จะดึง Default แต่ละ Field มาเติมให้เอง )
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
