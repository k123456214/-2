const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  realName: {
    type: DataTypes.STRING(50)
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '角色: admin, store_manager, cashier, supplier'
  },
  storeId: {
    type: DataTypes.INTEGER
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1:启用 0:禁用'
  }
});

module.exports = User;
