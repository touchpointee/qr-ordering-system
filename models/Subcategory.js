const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

subcategorySchema.index({ restaurantId: 1, categoryId: 1, sortOrder: 1 });

module.exports = mongoose.models.Subcategory || mongoose.model("Subcategory", subcategorySchema);
