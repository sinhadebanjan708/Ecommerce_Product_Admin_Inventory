module.exports = (sequelize, DataTypes) => {
  const ProductVariantImage = sequelize.define(
    "ProductVariantImage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      variant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      image_url: {
        type: DataTypes.STRING,
        allowNull: false
      },

      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      }
    },
    {
      tableName: "product_variant_images",
      timestamps: true
    }
  );

  ProductVariantImage.associate = (models) => {
    ProductVariantImage.belongsTo(models.ProductVariant, {
  foreignKey: "variant_id",
  as: "variant"
});
  };

  return ProductVariantImage;
};