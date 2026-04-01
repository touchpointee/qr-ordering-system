const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Printer",
      required: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ restaurantId: 1, kitchenId: 1 });

module.exports =
  mongoose.models.Section || mongoose.model("Section", sectionSchema);
