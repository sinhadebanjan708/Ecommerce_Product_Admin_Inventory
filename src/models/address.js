module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: DataTypes.STRING(100),
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    latitude: {
  type: DataTypes.DECIMAL(10, 8),
  allowNull: true
},

longitude: {
  type: DataTypes.DECIMAL(11, 8),
  allowNull: true
},

location_accuracy: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true
},
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'Addresses',
    timestamps: true,
    underscored: true
  });

  Address.associate = (models) => {
    Address.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Address.hasMany(models.Order, { foreignKey: 'address_id', as: 'orders' });
  };

  return Address;
};