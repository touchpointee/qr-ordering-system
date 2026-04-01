const mongoose = require("mongoose");

const kotItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const kotSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
      index: true,
    },
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Printer",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    items: [kotItemSchema],
    status: {
      type: String,
      enum: ["pending", "printed", "acknowledged", "done"],
      default: "pending",
      index: true,
    },
    printCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

kotSchema.index({ kitchenId: 1, status: 1 });

module.exports = mongoose.models.KOT || mongoose.model("KOT", kotSchema);
