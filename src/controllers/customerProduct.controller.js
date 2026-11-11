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

exports.searchProducts = async (req, res, next) => {
  try {
    const result = await CustomerProductService.searchProducts(req.query);

    res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getFeaturedProducts(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrendingProducts = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getTrendingProducts(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getNewArrivals = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getNewArrivals(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getBestSellers = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getBestSellers(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getOnSaleProducts = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getOnSaleProducts(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getProductsByCategory(
      req.params.categoryId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsBySubcategory = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getProductsBySubcategory(
      req.params.subcategoryId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductVariants = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getProductVariants(
      req.params.productId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// exports.checkAvailability = async (req, res, next) => {
//   try {
//     const result = await CustomerProductService.checkAvailability(
//       req.params.variantId,
//       req.query.warehouseId
//     );

//     res.status(200).json({
//       success: true,
//       data: result
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getRelatedProducts = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getRelatedProducts(
      req.params.productId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getRecommendations(
      req.params.productId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductFilters = async (req, res, next) => {
  try {
    const result = await CustomerProductService.getProductFilters(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
