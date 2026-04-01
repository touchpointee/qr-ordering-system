const mongoose = require("mongoose");

const orderSessionSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    sessionToken: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSessionSchema.index({ tableId: 1, status: 1 });

module.exports =
  mongoose.models.OrderSession ||
  mongoose.model("OrderSession", orderSessionSchema);
