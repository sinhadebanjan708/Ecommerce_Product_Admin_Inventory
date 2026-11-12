
const WishlistService = require("../services/wishlist.service");

exports.getWishlist = async (req, res, next) => {
  try {
    const result = await WishlistService.getWishlist(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: result
    });

  } catch (error) {
    next(error);
  }
};

exports.createWishlist = async (req, res, next) => {
  try {
    const result = await WishlistService.getOrCreateWishlist(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "Wishlist created successfully",
      data: result
    });

  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const result = await WishlistService.addToWishlist(
      req.user.user_id,
      req.body
    );

    return res.status(201).json({
      success: true,
      ...result
    });

  } catch (error) {
    next(error);
  }
};

exports.removeWishlistItem = async (req, res, next) => {
  try {
    const result = await WishlistService.removeWishlistItem(
      req.user.user_id,
      req.params.itemId
    );

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    next(error);
  }
};

exports.clearWishlist = async (req, res, next) => {
  try {
    const result = await WishlistService.clearWishlist(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    next(error);
  }
};

exports.moveToCart = async (req, res, next) => {
  try {
    const result = await WishlistService.moveToCart(
      req.user.user_id,
      req.params.itemId
    );

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    next(error);
  }
};
