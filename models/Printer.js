const mongoose = require("mongoose");

const printerSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    ipAddress: { type: String, required: true, trim: true },
    port: { type: Number, default: 9100 },
    type: {
      type: String,
      enum: ["network", "usb"],
      default: "network",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Printer || mongoose.model("Printer", printerSchema);
