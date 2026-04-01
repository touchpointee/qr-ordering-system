const Category = require("../../../../models/Category");
const Subcategory = require("../../../../models/Subcategory");
const MenuItem = require("../../../../models/MenuItem");
const { initDb } = require("../../../../lib/bootstrap");
const { handleRouteError, objectIdSchema } = require("../../../../lib/crud");

export async function GET(_request, { params }) {
  try {
    objectIdSchema("restaurantId").parse(params.restaurantId);
    await initDb();
    const [categories, subcategories, items] = await Promise.all([
      Category.find({ restaurantId: params.restaurantId }).sort({ sortOrder: 1, name: 1 }).lean(),
      Subcategory.find({ restaurantId: params.restaurantId }).sort({ sortOrder: 1, name: 1 }).lean(),
      MenuItem.find({ restaurantId: params.restaurantId, isAvailable: true }).lean(),
    ]);
    const itemsByCategory = items.reduce((acc, item) => {
      const key = String(item.categoryId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    const itemsBySubcategory = items.reduce((acc, item) => {
      if (!item.subcategoryId) return acc;
      const key = String(item.subcategoryId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    const subcategoriesByCategory = subcategories.reduce((acc, sub) => {
      const key = String(sub.categoryId);
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        ...sub,
        items: itemsBySubcategory[String(sub._id)] || [],
      });
      return acc;
    }, {});

    return Response.json({
      restaurantId: params.restaurantId,
      categories: categories
        .map((c) => ({
          ...c,
          items: itemsByCategory[String(c._id)] || [],
          subcategories: subcategoriesByCategory[String(c._id)] || [],
        }))
        .filter((c) => (c.items || []).length > 0 || (c.subcategories || []).some((s) => (s.items || []).length > 0)),
    });
  } catch (error) {
    return handleRouteError(error, "Menu fetch failed");
  }
}
