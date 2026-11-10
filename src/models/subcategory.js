
module.exports = (sequelize, DataTypes) => {
const Subcategory = sequelize.define(
  "Subcategory",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },

    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "Categories",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    },

    subcategory_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
    },

    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "active"
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "Subcategories",
    timestamps: false,
    freezeTableName: true
  }
);
Subcategory.associate = (models) => {
Subcategory.belongsTo(models.Category, {
  foreignKey: "category_id",
  as: "category"
})
  Subcategory.hasMany(models.Product, {
    foreignKey: "subcategory_id",
    as: "products"
  });
}
return Subcategory;
}
