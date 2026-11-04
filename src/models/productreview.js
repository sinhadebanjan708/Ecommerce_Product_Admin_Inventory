module.exports = (sequelize, DataTypes) => {
  const ProductReview = sequelize.define('ProductReview', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    review_text: DataTypes.TEXT
  }, {
    tableName: 'Product_Reviews',
    timestamps: true,
    underscored: true
  });

  ProductReview.associate = (models) => {
    ProductReview.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    ProductReview.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return ProductReview;
};