function getAdminRestaurantId(decoded) {
  return process.env.RESTAURANT_ID || decoded?.restaurantId || null;
}

function requireAdminRestaurantId(decoded) {
  const restaurantId = getAdminRestaurantId(decoded);
  if (!restaurantId) {
    const err = new Error("Restaurant is not configured");
    err.status = 500;
    throw err;
  }
  return restaurantId;
}

module.exports = {
  getAdminRestaurantId,
  requireAdminRestaurantId,
};
