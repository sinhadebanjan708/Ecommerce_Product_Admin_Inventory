const CustomerProductService =
  require("../services/customerProduct.service");

exports.getProducts = async (req, res) => {
  try {
    const products = await CustomerProductService.getProducts(
      req.query
    );

    return res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const product = await CustomerProductService.getProductDetails(
      req.params.productId
    );

    return res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const result = await CustomerProductService.checkAvailability(
      req.params.variantId
    );

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};