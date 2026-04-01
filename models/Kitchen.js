const mongoose = require("mongoose");

const kitchenSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

kitchenSchema.index({ restaurantId: 1, name: 1 });

module.exports =
  mongoose.models.Kitchen || mongoose.model("Kitchen", kitchenSchema);
