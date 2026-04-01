const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderSession",
      required: true,
      index: true,
    },
    placedBy: {
      type: String,
      enum: ["customer", "staff"],
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "billed", "cancelled"],
      default: "pending",
      index: true,
    },
    items: [orderItemSchema],
    kotIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "KOT" }],
    totalAmount: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ tableId: 1, status: 1 });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
