const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.STRING(200)
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

module.exports = Store;
