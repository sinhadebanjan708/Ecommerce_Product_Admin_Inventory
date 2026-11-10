
const { Category, Subcategory , sequelize } = require("../models");

const { Op } = require("sequelize");
class CategoryService {

  // Create category

async createCategory(data) {
  const { name, description, slug, image, status } = data;

  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }

  const categoryName = name.trim();

  // Check for duplicate category name (case-insensitive)
  const existingCategory = await Category.findOne({
    where: sequelize.where(
      sequelize.fn("LOWER", sequelize.col("category_name")),
      categoryName.toLowerCase()
    )
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  // Check for duplicate slug
  if (slug) {
    const existingSlug = await Category.findOne({
      where: { slug }
    });

    if (existingSlug) {
      throw new Error("Category slug already exists");
    }
  }

  return await Category.create({
    category_name: categoryName,
    description,
    slug,
      image: data.image,
    status
  });
}


  // Get all active categories with subcategories
  async getCategories() {
    return await Category.findAll({
      where: {
        status: "active"
      },
      include: [
        {
          model: Subcategory,
          as: "subcategories",
          where: {
            status: "active"
          },
          required: false
        }
      ],
      order: [["category_name", "ASC"]]
    });
  }

  // Get category by ID
  async getCategoryById(categoryId) {
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: Subcategory,
          as: "subcategories"
        }
      ]
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  // Update category
async updateCategory(categoryId, data) {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const updateData = {};

  // Map API fields to database fields
  if (data.name !== undefined) {
    if (!data.name.trim()) {
      throw new Error("Category name cannot be empty");
    }

    updateData.category_name = data.name.trim();
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.slug !== undefined) {
    updateData.slug = data.slug.trim();
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.image !== undefined) {
    updateData.image = data.image;
  }

  await category.update(updateData);

  return category;
}

  // Delete category
  async deleteCategory(categoryId) {
    const category = await Category.findByPk(categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    await category.destroy();

    return {
      message: "Category deleted successfully"
    };
  }
}

module.exports = new CategoryService();
