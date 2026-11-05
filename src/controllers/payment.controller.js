const PaymentService = require("../services/payment.service");

exports.createPayment = async (req, res) => {
  try {
    const result = await PaymentService.createPayment(
      req.params.orderId,
      req.user.id
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