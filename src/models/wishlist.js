
module.exports = (sequelize, DataTypes) => {

  const Wishlist = sequelize.define(
    "Wishlist",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true
      },

      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "active"
      }
    },
    {
      tableName: "wishlists",
      timestamps: true,
      underscored: true
    }
  );
 Wishlist.associate = (models) => {
    Wishlist.hasMany(models.WishlistItem, {
    foreignKey: "wishlist_id",
    as: "items",
    onDelete: "CASCADE"
    });
 }

  return Wishlist;
};
