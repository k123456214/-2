const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  minStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  batchNo: {
    type: DataTypes.STRING(50)
  },
  productionDate: {
    type: DataTypes.DATE
  },
  expiryDate: {
    type: DataTypes.DATE
  }
});

module.exports = Stock;
