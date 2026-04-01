const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

restaurantSchema.index({ isActive: 1 });

module.exports =
  mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);
