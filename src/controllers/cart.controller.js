const CartService = require("../services/cart.service");

exports.getCart = async (req, res) => {
  try {
    const result = await CartService.getCart(req.user.user_id);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addItem = async (req, res) => {
  try {
    console.log('cart_id',req.body.variant_id)
    const result = await CartService.addToCart(
      req.user.user_id,
      Number(req.body.variant_id),
      Number(req.body.quantity)
    );

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const result = await CartService.updateCartItem(
      req.user.user_id,
      Number(req.params.itemId),
      Number(req.body.quantity),
      String(req.body.size)
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const result = await CartService.removeCartItem(
      req.user.user_id,
      Number(req.params.itemId)
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};