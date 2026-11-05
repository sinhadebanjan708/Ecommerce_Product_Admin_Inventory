const CheckoutService = require("../services/checkout.service");

exports.createOrder = async (req, res) => {
  try {
    const result = await CheckoutService.createOrder(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      ...result
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};