const MenuItem = require("../models/MenuItem");
const Kitchen = require("../models/Kitchen");
const Order = require("../models/Order");
const KOT = require("../models/KOT");
const Printer = require("../models/Printer");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const { printWithRetry } = require("./printer");
const { getIO } = require("./socket");

function groupByKitchen(items) {
  const map = new Map();
  for (const it of items) {
    const kid = it.kitchenId.toString();
    if (!map.has(kid)) map.set(kid, []);
    map.get(kid).push(it);
  }
  return map;
}

async function populateKotForEmit(kotDoc) {
  const kot = kotDoc.toObject ? kotDoc.toObject() : { ...kotDoc };
  const [table, kitchen] = await Promise.all([
    Table.findById(kot.tableId).lean(),
    mongoose.model("Kitchen").findById(kot.kitchenId).lean(),
  ]);
  return {
    ...kot,
    tableName: table?.name,
    sectionName: kitchen?.name,
    kitchenName: kitchen?.name,
  };
}

async function processOrderKots({
  order,
  restaurant,
  table,
  lineItemsInput,
}) {
  const io = getIO();
  const groups = groupByKitchen(lineItemsInput);
  const kotIds = [];
  const kitchenIdsEmitted = new Set();

  for (const [, groupItems] of groups) {
    const first = groupItems[0];
    const kitchen = await Kitchen.findById(first.kitchenId);
    if (!kitchen) {
      throw new Error(`Kitchen not found for item ${first.menuItemId}`);
    }
    if (!kitchen.printerId) {
      throw new Error(`Printer not configured for kitchen ${kitchen.name}`);
    }
    const printer = await Printer.findById(kitchen.printerId);
    if (!printer) {
      throw new Error("Printer not configured for section");
    }

    const kotItems = groupItems.map((g) => ({
      menuItemId: g.menuItemId,
      name: g.name,
      qty: g.qty,
      note: g.note || "",
    }));

    const kot = await KOT.create({
      orderId: order._id,
      tableId: order.tableId,
      sectionId: null,
      kitchenId: kitchen._id,
      printerId: printer._id,
      restaurantId: order.restaurantId,
      items: kotItems,
      status: "pending",
      printCount: 0,
      createdAt: new Date(),
    });

    kotIds.push(kot._id);

    const printPayload = {
      restaurantName: restaurant.name,
      tableName: table.name,
      sectionName: kitchen.name,
      kotLabel: `KOT #${kot._id.toString().slice(-6).toUpperCase()}`,
      items: kotItems.map((k) => ({
        name: k.name,
        qty: k.qty,
        note: k.note,
      })),
    };

    const printResult = await printWithRetry(printer, printPayload);

    if (printResult.ok) {
      kot.status = "printed";
      kot.printCount = (kot.printCount || 0) + 1;
      await kot.save();
    } else {
      await kot.save();
    }

    const populated = await populateKotForEmit(
      await KOT.findById(kot._id)
        .populate("orderId")
        .populate("tableId")
        .populate("sectionId")
        .populate("kitchenId")
        .populate("printerId")
    );

    if (io) {
      io.to(`kitchen_${kitchen._id.toString()}`).emit(
        "new_kot",
        populated
      );
      kitchenIdsEmitted.add(kitchen._id.toString());
    }
  }

  await Order.findByIdAndUpdate(order._id, { $set: { kotIds } });

  if (io) {
    io.to("staff_general").emit("new_order", {
      orderId: order._id.toString(),
      tableId: order.tableId.toString(),
      tableName: table.name,
    });
  }

  return { kotIds, kitchenIdsEmitted };
}

async function validateAndBuildLineItems(restaurantId, cartItems) {
  const lineItems = [];
  for (const row of cartItems) {
    const menuItem = await MenuItem.findOne({
      _id: row.menuItemId,
      restaurantId,
    });
    if (!menuItem) {
      throw new Error(`Menu item not found: ${row.menuItemId}`);
    }
    if (!menuItem.isAvailable) {
      throw new Error(`Item unavailable: ${menuItem.name}`);
    }
    if (!menuItem.kitchenId) {
      throw new Error(`Kitchen not configured for menu item: ${menuItem.name}`);
    }
    const requestKitchen = row.kitchenId || row.sectionId;
    if (!requestKitchen) {
      throw new Error(`Kitchen missing in order payload for item: ${menuItem.name}`);
    }
    if (String(menuItem.kitchenId) !== String(requestKitchen)) {
      throw new Error(`Kitchen mismatch for ${menuItem.name}`);
    }
    const qty = Number(row.qty);
    if (!Number.isFinite(qty) || qty < 1) {
      throw new Error("Invalid quantity");
    }
    lineItems.push({
      menuItemId: menuItem._id,
      sectionId: menuItem.sectionId,
      kitchenId: menuItem.kitchenId,
      name: menuItem.name,
      price: menuItem.price,
      qty,
      note: row.note || "",
    });
  }
  return lineItems;
}

function sumTotal(lineItems) {
  return lineItems.reduce((s, l) => s + l.price * l.qty, 0);
}

module.exports = {
  processOrderKots,
  validateAndBuildLineItems,
  sumTotal,
  populateKotForEmit,
};
