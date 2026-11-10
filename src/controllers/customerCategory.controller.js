
const CustomerCategoryService =
  require("../services/customerCategory.service");


// API 1: Get all categories
exports.getCategories = async (req, res) => {

  try {

    const categories =
      await CustomerCategoryService.getCategories();

    return res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {

    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });

  }

};


// API 2: Get category by ID
exports.getCategoryById = async (req, res) => {

  try {

    const category =
      await CustomerCategoryService.getCategoryById(
        req.params.categoryId
      );

    return res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {

    if (error.message === "Category not found") {

      return res.status(404).json({
        success: false,
        message: error.message
      });

    }

    console.error("Get category by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category"
    });

  }

};
