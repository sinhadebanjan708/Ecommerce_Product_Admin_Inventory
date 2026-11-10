
const categoryService = require("../services/category.service");

exports.createCategory = async (req, res) => {
  try {
    const imagePath = req.file
      ? `uploads/categories/${req.file.filename}`
      : null;

    const category = await categoryService.createCategory({
      ...req.body,
      image: imagePath
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {
    // Remove uploaded file if category creation fails
    if (req.file) {
      const fs = require("fs");
      const path = require("path");

      const filePath = path.join(
        process.cwd(),
        "uploads",
        "categories",
        req.file.filename
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCategory = async(req, res) => {
  try {
    const { categoryId } = req.params;
 console.log("Category ID:", req.params.categoryId);
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    const updateData = {
      ...req.body
    };

    // Only replace the existing image if a new image was uploaded
    if (req.file) {
      updateData.image = `uploads/categories/${req.file.filename}`;
    }

    const category = await categoryService.updateCategory(
      categoryId,
      updateData
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {
    console.error("Update category error:", error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

exports.deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(
      req.params.id
    );

    return res.status(200).json({
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
