module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    email: DataTypes.STRING(255),
    phone: DataTypes.STRING(20),
    otp_code: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    otp_type: {
      type: DataTypes.ENUM('login', 'register', 'verification'),
      allowNull: false
    },
    channel: {
      type: DataTypes.ENUM('email', 'phone'),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'Otps',
    underscored: true,
    timestamps: true,
    updatedAt: false
  });

  Otp.associate = (models) => {
    Otp.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Otp;
};