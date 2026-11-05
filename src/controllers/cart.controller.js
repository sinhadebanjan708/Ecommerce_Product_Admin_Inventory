const CartService = require("../services/cart.service");

exports.getCart = async (req, res) => {
  try {
    const result = await CartService.getCart(req.user.id);

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
    const result = await CartService.addItem(
      req.user.id,
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
    const result = await CartService.updateItem(
      req.user.id,
      Number(req.params.itemId),
      Number(req.body.quantity)
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
    const result = await CartService.removeItem(
      req.user.id,
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