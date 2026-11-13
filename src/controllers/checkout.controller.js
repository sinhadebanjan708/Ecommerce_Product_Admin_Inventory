const CheckoutService = require("../services/checkout.service");

exports.createOrder = async (req, res) => {
  try {
    const result = await CheckoutService.createOrder(
      req.user.user_id,
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

// GET CHECKOUT SUMMARY
exports.getCheckoutSummary = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { item_ids } = req.query;

    const result = await CheckoutService.getCheckoutSummary(
      userId,
      item_ids
    );

    return res.status(200).json({
      success: true,
      message: "Checkout summary fetched successfully",
      data: result,
    });

  } catch (error) {
     console.log("CHECKOUT SUMMARY ERROR:", error.message);
    console.log("MYSQL ERROR:", error.original?.message);
    console.log("SQL QUERY:", error.sql);
    console.log("ERROR DETAILS:", error);
    next(error);
  }
};


// SELECT DELIVERY ADDRESS
exports.selectDeliveryAddress = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { address_id } = req.body;

    const result = await CheckoutService.selectDeliveryAddress(
      userId,
      address_id
    );

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
};