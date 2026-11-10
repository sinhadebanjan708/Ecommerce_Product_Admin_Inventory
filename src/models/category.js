module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      category_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      image: {
        type: DataTypes.STRING,
        allowNull: true
      },

      status: {
        type: DataTypes.ENUM(
          "active",
          "inactive"
        ),
        defaultValue: "active"
      }
    },
    {
      tableName: "Categories",
      timestamps: true,
       underscored: true
    }
  );

  Category.associate = (models) => {
    // Category.belongsTo(models.Category, { foreignKey: 'parent_id', as: 'parent' });
    // Category.hasMany(models.Category, { foreignKey: 'parent_id', as: 'children' });
        Category.hasMany(models.Subcategory, {
        foreignKey: "category_id",
        as: "subcategories"
    });
    Category.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });
  };

  return Category;
};