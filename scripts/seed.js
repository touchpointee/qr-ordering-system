const { loadEnvConfig } = require("@next/env");
const { v4: uuidv4 } = require("uuid");

loadEnvConfig(process.cwd());

const { connectDB } = require("../lib/mongodb");
require("../models");

const Restaurant = require("../models/Restaurant");
const Kitchen = require("../models/Kitchen");
const Printer = require("../models/Printer");
const Table = require("../models/Table");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const { hashPassword } = require("../lib/auth");

async function run() {
  await connectDB();

  const restaurant = await Restaurant.create({ name: "Food Book", address: "Main Street", isActive: true });
  const printers = await Printer.insertMany([
    { restaurantId: restaurant._id, name: "Kitchen Printer 1", ipAddress: "192.168.1.100", port: 9100, type: "network" },
    { restaurantId: restaurant._id, name: "Kitchen Printer 2", ipAddress: "192.168.1.101", port: 9100, type: "network" },
  ]);

  const kitchens = await Kitchen.insertMany([
    { restaurantId: restaurant._id, name: "Main Kitchen", description: "Primary cooking line", printerId: printers[0]._id },
    { restaurantId: restaurant._id, name: "Beverage Kitchen", description: "Drinks and desserts", printerId: printers[1]._id },
  ]);

  const tables = [];
  for (let i = 1; i <= 10; i += 1) {
    tables.push({ restaurantId: restaurant._id, name: `T${i}`, qrToken: uuidv4(), isActive: true });
  }
  await Table.insertMany(tables);

  const categories = await Category.insertMany([
    { restaurantId: restaurant._id, name: "Starters", sortOrder: 1 },
    { restaurantId: restaurant._id, name: "Main Course", sortOrder: 2 },
    { restaurantId: restaurant._id, name: "Beverages", sortOrder: 3 },
  ]);

  const itemData = [];
  for (let i = 1; i <= 15; i += 1) {
    const category = categories[(i - 1) % categories.length];
    const kitchen = kitchens[(i - 1) % kitchens.length];
    itemData.push({
      restaurantId: restaurant._id,
      kitchenId: kitchen._id,
      categoryId: category._id,
      name: `Sample Item ${i}`,
      description: `Sample menu item ${i}`,
      price: 80 + i * 10,
      isAvailable: true,
      isVeg: i % 2 === 0,
      image: "",
    });
  }
  await MenuItem.insertMany(itemData);

  const adminPassword = "Admin@12345";
  const passwordHash = await hashPassword(adminPassword);
  const emailSuffix = restaurant._id.toString().slice(-6);
  const adminEmail = `admin_${emailSuffix}@foodbook.local`;
  await User.create({
    restaurantId: restaurant._id,
    name: "Super Admin",
    username: `admin_${emailSuffix}`,
    email: adminEmail,
    passwordHash,
    role: "superadmin",
  });

  console.log("Seed complete");
  console.log("RESTAURANT_ID=", restaurant._id.toString());
  console.log("Admin email:", adminEmail);
  console.log("Admin password:", adminPassword);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
