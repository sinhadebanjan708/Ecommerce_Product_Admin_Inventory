
const { Category, Subcategory } = require("../models");

class SubcategoryService {

  // Create subcategory
  async createSubcategory(data) {
    const {
      category_id,
      subcategory_name,
      slug,
      image
    } = data;

    if (!category_id || !subcategory_name || !slug) {
      throw new Error(
        "category_id, subcategory_name and slug are required"
      );
    }

    // Validate parent category
    const category = await Category.findOne({
      where: {
        id: category_id,
        status: "active"
      }
    });

    if (!category) {
      throw new Error("Active category not found");
    }

    return await Subcategory.create({
      category_id,
      subcategory_name,
      slug,
      image
    });
  }

  // Get all active subcategories
  async getSubcategories() {
    return await Subcategory.findAll({
      where: {
        status: "active"
      },
      include: [
        {
          model: Category,
          as: "category"
        }
      ],
      order: [["subcategory_name", "ASC"]]
    });
  }

  // Get subcategories by category ID
  async getSubcategoriesByCategory(categoryId) {
    const category = await Category.findByPk(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    return await Subcategory.findAll({
      where: {
        category_id: categoryId,
        status: "active"
      },
      order: [["subcategory_name", "ASC"]]
    });
  }

  // Get subcategory by ID
  async getSubcategoryById(subcategoryId) {
    const subcategory = await Subcategory.findByPk(
      subcategoryId,
      {
        include: [
          {
            model: Category,
            as: "category"
          }
        ]
      }
    );

    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    return subcategory;
  }

  // Update subcategory
  async updateSubcategory(subcategoryId, data) {
    const subcategory = await Subcategory.findByPk(subcategoryId);

    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    const {
      category_id,
      subcategory_name,
      slug,
      image,
      status
    } = data;

    // Validate new category if category_id is provided
    if (category_id !== undefined) {
      const category = await Category.findOne({
        where: {
          id: category_id,
          status: "active"
        }
      });

      if (!category) {
        throw new Error("Active category not found");
      }
    }

    await subcategory.update({
      ...(category_id !== undefined && { category_id }),
      ...(subcategory_name !== undefined && { subcategory_name }),
      ...(slug !== undefined && { slug }),
      ...(image !== undefined && { image }),
      ...(status !== undefined && { status })
    });

    return subcategory;
  }

  // Delete subcategory
  async deleteSubcategory(subcategoryId) {
    const subcategory = await Subcategory.findByPk(subcategoryId);

    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    await subcategory.destroy();

    return {
      message: "Subcategory deleted successfully"
    };
  }
}

module.exports = new SubcategoryService();
