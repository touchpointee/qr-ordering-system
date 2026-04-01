const { connectDB } = require("./mongodb");

function loadModels() {
  require("../models");
}

async function initDb() {
  loadModels();
  await connectDB();
}

module.exports = { initDb };
