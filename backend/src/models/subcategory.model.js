import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    subcategory_name: {
      type: String,
      required: true,
      trim: true,
    },

    category_ids: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      required: true,
      validate: {
        validator: (value) => value.length > 0, // subcategory ต้องมี category อย่างน้อย 1 อัน
        message: "At least one category is required.",
      },
    },
  },
  {
    timestamps: true,
  },
);

export const Subcategory = mongoose.model("Subcategory", subcategorySchema);
