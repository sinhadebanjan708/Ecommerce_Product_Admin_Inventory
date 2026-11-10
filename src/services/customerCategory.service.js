
const { Category } = require("../models");

class CustomerCategoryService {

  // API 1: Get all active categories
  async getCategories() {

    return Category.findAll({
      where: {
        status: "active"
      },

      order: [
        ["category_name", "ASC"]
      ]
    });

  }


  // API 2: Get category by ID
  async getCategoryById(categoryId) {

    const category = await Category.findOne({

      where: {
        id: categoryId,
        status: "active"
      }

    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;

  }

}

module.exports = new CustomerCategoryService();
