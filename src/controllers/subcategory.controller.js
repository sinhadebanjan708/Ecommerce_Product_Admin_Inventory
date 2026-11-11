
const subcategoryService = require("../services/subcategory.service");

exports.createSubcategory = async (req, res) => {
    try {

        console.log("Uploaded file:", req.file);
        console.log("Request body:", req.body);

        const subcategory = await subcategoryService.createSubcategory({
            ...req.body,
            image: req.file
                ? `/uploads/subcategory/${req.file.filename}`
                : null
        });

        return res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: subcategory
        });

    } catch (error) {
        console.error("Subcategory error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await subcategoryService.getSubcategories();

    return res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const subcategories =
      await subcategoryService.getSubcategoriesByCategory(
        req.params.categoryId
      );

    return res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSubcategoryById = async (req, res) => {
  try {
       const { subcategoryId } = req.params;

        const result = await subcategoryService.getSubcategoryById(
            subcategoryId
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

exports.updateSubcategory = async (req, res) => {
  try {
    const subcategory =
      await subcategoryService.updateSubcategory(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subcategory
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const result = await subcategoryService.deleteSubcategory(
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
