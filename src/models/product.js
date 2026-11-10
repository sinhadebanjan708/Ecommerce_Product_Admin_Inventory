module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },

      updated_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },

      published_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },

      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },

      slug: {
        type: DataTypes.STRING(280),
        allowNull: false,
        unique: true
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      base_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
      },

      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "draft",
        validate: {
          isIn: [["draft", "active", "inactive", "archived","published"]]
        }
      },
      archived_at: {
        type: DataTypes.DATE,
        allowNull: true
      },

      published_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "Products",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true
    }
  );

    Product.associate = (models) => {

  console.log("Checking Product associations:");

  console.log("Category:", models.Category);
  console.log("Subcategory:", models.Subcategory);
  console.log("User:", models.User);
  console.log("ProductImage:", models.ProductImage);
  console.log("ProductVariant:", models.ProductVariant);
  console.log("ProductReview:", models.ProductReview);
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Product.belongsTo(models.Subcategory, {
    foreignKey: "subcategory_id",
    as: "subcategory"
    });
    Product.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'images' });
    Product.hasMany(models.ProductVariant, { foreignKey: 'product_id', as: 'variants' });
    Product.hasMany(models.ProductReview, { foreignKey: 'product_id', as: 'reviews' });
  };

  return Product;
};