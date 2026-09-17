import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    subcategory_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Subcategory = mongoose.model("Subcategory", subcategorySchema);
