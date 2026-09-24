import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../../models/user.model.js";
import { sendResetPasswordEmail } from "../../utils/mailer.js";

export const passwordRouter = Router();

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// request a reset link
passwordRouter.post("/forgot", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    const user = await User.findOne({ email });

    // Always respond the same way whether or not the email exists,
    // so the endpoint can't be used to check which emails are registered.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = hashToken(rawToken);
      user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

      try {
        await sendResetPasswordEmail(user.email, resetUrl);
      } catch (mailError) {
        console.error("Failed to send reset email:", mailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
});

// set a new password using the token from the emailed link
passwordRouter.post("/reset/:token", async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required!",
      });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match!" });
    }
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 6 and 20 characters!",
      });
    }

    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Reset link is invalid or has expired!" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    next(error);
  }
});
