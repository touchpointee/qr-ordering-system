const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
    currentSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderSession",
      default: null,
    },
    billRequested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Table || mongoose.model("Table", tableSchema);
