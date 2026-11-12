
module.exports = (sequelize, DataTypes) => {

  const WishlistItem = sequelize.define(
    "WishlistItem",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      wishlist_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      variant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      }
    },
    {
      tableName: "wishlist_items",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["wishlist_id", "variant_id"]
        }
      ]
    }
  );
 WishlistItem.associate = (models) => {
    WishlistItem.belongsTo(models.Wishlist, {
    foreignKey: "wishlist_id",
    as: "wishlist"
    });

    WishlistItem.belongsTo(models.ProductVariant, {
    foreignKey: "variant_id",
    as: "variant"
    });
 }
  return WishlistItem;
};
