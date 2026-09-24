import { Router } from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import { User } from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import { protect } from "../../middlewares/protect.js";
import { authorize } from "../../middlewares/authorize.js";
import { cloudinary } from "../../config/cloudinary.js";

export const userRouter = Router();

// middleware ของ express สำหรับรับไฟล์รูปโปรไฟล์จาก req
// multer.memoryStorage เก็บไฟล์จาก req ไว้บน memory ของ server ก่อน (เป็น Buffer)
const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // สูงสุด 5 MB ไฟล์เดียว
}).single("avatar");

//get all users (admin only)
userRouter.get("/", protect, authorize(["admin"]), async (req, res, next) => {
  try {
    const data = await User.find().select("-password");
    if (data.length === 0) {
      return res.status(400).json({ message: "User's data is empty!" });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

//register user
userRouter.post("/register", async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Firstname, lastname, email and password are required!",
      });
    }
    const salt = await bcrypt.genSalt(12);
    const newPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: newPassword,
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Can not create user!" });
    }
    return res
      .status(201)
      .json({ success: true, message: "Created user successfully!", user });
  } catch (error) {
    next(error);
  }
});

//update user's data (owner or admin only; role can only be changed by admin)
userRouter.patch("/:userId", protect, async (req, res, next) => {
  try {
    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser._id.toString() === req.params.userId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only update your own account.",
      });
    }

    const {
      username,
      email,
      password,
      firstname,
      lastname,
      role,
    } = req.body;

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      updateFields.password = await bcrypt.hash(password, salt);
    }
    if (firstname) updateFields.firstname = firstname;
    if (lastname) updateFields.lastname = lastname;
    if (role && isAdmin) updateFields.role = role;
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update!",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updateFields,
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Updated user partially!",
      updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// add address (owner or admin only)
userRouter.patch("/:userId/address", protect, async (req, res, next) => {
  try {
    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser._id.toString() === req.params.userId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only manage your own address.",
      });
    }

    const { address } = req.body;

    const userData = await User.findOne({ _id: req.params.userId });

    for (let i = 0; i < userData.address.length; i++) {
      if (
        address.houseNo == userData.address[i].houseNo &&
        address.street == userData.address[i].street &&
        address.zipCode == userData.address[i].zipCode
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This address has already been saved. Please enter a new address!",
        });
      }
    }

    if (address.isDefault) {
      // เช็กว่า user ตั้งที่อยู่เป็น isDefault ไว้หรือไม่ หากตั้งไว้ ตัว $set จะอัปเดตค่า isDefault ทั้งหมดภายใน address ให้เป็น false
      // ใช้เพื่อให้ user ตั้งที่อยู่ default ได้แค่อันเดียว
      await User.updateOne(
        { _id: req.params.userId },
        {
          // $[] เป็นการบอก MongoDB ว่า ให้เจาะเข้าไปในทุก Object ที่อยู่ใน Array address
          $set: { "address.$[].isDefault": false },
        },
      );
    }

    const updatedAddress = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { address: address } },
      { new: true, runValidators: true },
    );

    if (!updatedAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Can not update address!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Updated address successfully!" });
  } catch (error) {
    next(error);
  }
});

// delete address (owner or admin only)
userRouter.delete("/:userId/address/:addressId", protect, async (req, res, next) => {
  try {
    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser._id.toString() === req.params.userId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only manage your own address.",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { address: { _id: req.params.addressId } } },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User or address not found!" });
    }
    return res.status(200).json({
      success: true,
      message: "Deleted address successfully!",
    });
  } catch (error) {
    next(error);
  }
});

// upload profile picture to Cloudinary (owner or admin only)
userRouter.post("/:userId/avatar", protect, uploadAvatar, async (req, res, next) => {
  try {
    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser._id.toString() === req.params.userId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only upload your own profile picture.",
      });
    }

    // ตรวจสอบว่ามีไฟล์รูปภาพถูกส่งมาจาก req หรือไม่
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided!" });
    }

    // ตรวจสอบว่าในไฟล์ config มี cloud name ที่ใช้งานหรือไม่
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary is not configured on the server!",
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // เก็บ public_id ของรูปเดิมไว้ เพื่อลบออกจาก Cloudinary หลังอัปโหลดรูปใหม่สำเร็จ
    const oldPublicId = user.avatar_public_id;

    // อัปโหลดรูปโปรไฟล์ขึ้น Cloudinary
    // cloudinary.uploader.upload_stream ทำงานแบบ callback จึงต้องห่อด้วย Promise เพื่อใช้ await
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        // ให้เก็บรูปไว้ในโฟลเดอร์ gearverse/avatars และระบุว่าเป็นรูปภาพ
        { folder: "gearverse/avatars", resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      stream.end(req.file.buffer);
    });

    // บันทึก URL และ public_id ของรูปใหม่ลงใน user document
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { avatar: upload.secure_url, avatar_public_id: upload.public_id },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // ลบรูปโปรไฟล์เก่าออกจาก Cloudinary (ถ้ามี)
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully!",
      avatar: updatedUser.avatar,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// delete profile picture from Cloudinary (owner or admin only)
userRouter.delete("/:userId/avatar", protect, async (req, res, next) => {
  try {
    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser._id.toString() === req.params.userId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you can only delete your own profile picture.",
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const publicId = user.avatar_public_id;

    // ล้างค่า avatar ออกจาก user document
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $unset: { avatar: 1, avatar_public_id: 1 } },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // ลบรูปโปรไฟล์ออกจาก Cloudinary โดยใช้ public_id ที่เก็บไว้
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully!",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

//delete user (admin only)
userRouter.delete("/:userId", protect, authorize(["admin"]), async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Deleted user succesfully!" });
  } catch (error) {
    next(error);
  }
});

//get current user from cookie
userRouter.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user._id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:userId", protect, async (req, res, next) => {
  try {
    const currentUser = req.user.user;
    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser._id.toString() === req.params.userId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        message: "Forbidden: you can only view your own account.",
      });
    }

    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    return res.json({
      data: user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//user login
userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required!" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// user logout
userRouter.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successfully.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
