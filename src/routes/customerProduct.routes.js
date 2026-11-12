const router = require("express").Router();


const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const customerOnly = [
  authMiddleware,
  authorizeRoles("CUSTOMER")
];

const controller =
  require("../controllers/customerProduct.controller");

router.get("/", ...customerOnly ,controller.getProducts);

router.get("/productdetail/:productId", ...customerOnly, controller.getProductDetails);

router.get(
  "/../variants/:variantId/availability",...customerOnly,
  controller.checkAvailability
);


// Public/customer product browsing
// router.get("/", controller.getProducts);
router.get("/search", controller.searchProducts);
router.get("/featured", controller.getFeaturedProducts);
router.get("/trending", controller.getTrendingProducts);
router.get("/new-arrivals", controller.getNewArrivals);
router.get("/best-sellers", controller.getBestSellers);
router.get("/on-sale", controller.getOnSaleProducts);
router.get("/filters", controller.getProductFilters);

// Category APIs
router.get("/categories",...customerOnly, controller.getCategories);

router.get(
  "/categories/:categoryId", ...customerOnly,
  controller.getCategoryById
);

// Subcategory APIs
router.get(
  "/categories/:categoryId/subcategories",...customerOnly,
  controller.getSubcategoriesByCategory
);

router.get("/subcategories", ...customerOnly, controller.getSubcategories);

router.get(
  "/subcategories/:subcategoryId", ...customerOnly,
  controller.getSubcategoryById
);


// Category-based browsing
router.get("/category/:categoryId",...customerOnly, controller.getProductsByCategory);
router.get("/subcategory/:subcategoryId", ...customerOnly,controller.getProductsBySubcategory);


//Product-Variant By Category and Subcategpry
router.get(
  "/categories/:categoryId/variants",
  controller.getProductVariantsByCategory
);

router.get(
  "/subcategories/:subcategoryId/variants",
  controller.getProductVariantsBySubcategory
);

// Product-specific routes
router.get("/:productId/variants", ...customerOnly, controller.getProductVariants);
router.get("/:productId/related", ...customerOnly, controller.getRelatedProducts);
router.get("/:productId/recommendations", ...customerOnly, controller.getRecommendations);
// router.get("/:productId",...customerOnly, controller.getProductDetails);

module.exports = router;