const {
  Order,
  Payment
} = require("../models");

// Replace this with your actual Razorpay SDK integration.
const razorpay = require("../config/razorpay");

class PaymentService {

  async createPayment(orderId, userId) {
    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: "PENDING_PAYMENT"
      }
    });

    if (!order) {
      throw new Error("Pending order not found");
    }

    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total_amount) * 100),
      currency: "INR",
      receipt: `order_${order.id}`
    });

    const payment = await Payment.create({
      order_id: order.id,
      gateway: "RAZORPAY",
      gateway_order_id: paymentOrder.id,
      amount: order.total_amount,
      status: "PENDING"
    });

    return {
      order_id: order.id,
      payment_id: payment.id,
      razorpay_order_id: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency
    };
  }
}

module.exports = new PaymentService();