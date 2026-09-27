import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        discount_amount: { type: Number, required: true },
        discount_type: { type: String, required: true, enum: ['percent', 'baht']},
        min_order_price: { type: Number, required: true },
        max_use: { type: Number, required: true },
        // จำนวนออเดอร์ที่ใช้โค้ดนี้ เพิ่มตอนสร้างออเดอร์ และไม่ได้คืนโควตาเมื่อยกเลิก
        used_count: { type: Number, default: 0, min: 0 },
        is_active: { type: Boolean, required: true },
        promo_start: { type: Date, required: true },
        expire_at: { type: Date, required: true },
        description: { type: String, trim: true },
        created_at: { type: Date, default: Date.now }
    },
    {
        timestamps: true
    }
)

export const Promo = mongoose.model('Promo_code', promoSchema)
