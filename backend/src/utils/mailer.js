import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendResetPasswordEmail(toEmail, resetUrl) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: "รีเซ็ตรหัสผ่านบัญชี GearVerse ของคุณ",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี GearVerse นี้ กดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์หมดอายุภายใน 15 นาที)</p>
        <p><a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background:#a855f7; color:#fff; text-decoration:none; border-radius:8px;">ตั้งรหัสผ่านใหม่</a></p>
        <p>ถ้าคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยต่ออีเมลนี้ได้</p>
      </div>
    `,
  });
}
