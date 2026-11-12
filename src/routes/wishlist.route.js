
const express = require("express");
const router = express.Router();

const WishlistController = require("../controllers/wihslist.controller");

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const customerOnly = [
  authMiddleware,
  authorizeRoles("CUSTOMER")
];

// GET WISHLIST
router.get("/", ...customerOnly, WishlistController.getWishlist);

router.post("/create", ...customerOnly, WishlistController.createWishlist);

// ADD TO WISHLIST
router.post("/items", ...customerOnly, WishlistController.addToWishlist);

// REMOVE WISHLIST ITEM
router.delete("/items/:itemId", ...customerOnly, WishlistController.removeWishlistItem);

// CLEAR WISHLIST
router.delete("/", ...customerOnly, WishlistController.clearWishlist);

// MOVE WISHLIST ITEM TO CART
router.post(
  "/items/:itemId/move-to-cart", ...customerOnly,
  WishlistController.moveToCart
);

module.exports = router;
