import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import { protect } from "../../middlewares/protect.js";

export const userRouter = Router();

//get all users
userRouter.get("/", async (req, res, next) => {
  try {
    const data = await User.find();
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

//update user's data
userRouter.patch("/:userId", async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstname,
      lastname,
      phoneNumber,
      role,
    } = req.body;

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (password) updateFields.password = password;
    if (firstname) updateFields.firstname = firstname;
    if (lastname) updateFields.lastname = lastname;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (role) updateFields.role = role;
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
    );

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

// add address
userRouter.patch("/:userId/address", async (req, res, next) => {
  try {
    const address = req.body;
    console.log(req.body)
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
    console.log(error)
    next(error);
  }
});

// delete address
userRouter.delete("/:userId/address/:addressId", async (req, res, next) => {
  try {
    const deletedAddress = await User.findByIdAndDelete(req.params.addressId);
    if (!deletedAddress) {
      return res.status(400).json({ success: false, message: "" });
    }
  } catch (error) {
    next(error);
  }
});

//delete user
userRouter.delete("/:userId", async (req, res, next) => {
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

userRouter.get("/auth/:id", protect, async (req, res, next) => {
  try {
    console.log(req.params)
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
    return res.status(200).json({ success: true, user });
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
    console.log("this is", user);

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

    const isSecure =
      req.secure ||
      String(req.headers["x-forwarded-proto"] || "")
        .split(",")[0]
        .trim() === "https";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
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
    const isSecure =
      req.secure ||
      String(req.headers["x-forwarded-proto"] || "")
        .split(",")[0]
        .trim() === "https";

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
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
