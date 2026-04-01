const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true, default: null },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "kitchen_manager", "waiter", "cashier"],
      required: true,
    },
    assignedKitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
