const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockLoss = sequelize.define('StockLoss', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  qty: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  reason: {
    type: DataTypes.STRING(200),
    comment: '损耗原因'
  },
  category: {
    type: DataTypes.STRING(20),
    comment: '损耗分类: natural, expired, spoiled, damaged, difference'
  },
  imageUrl: {
    type: DataTypes.STRING(500)
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0:待审核 1:已审核 2:已驳回'
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    comment: '审核人用户ID'
  }
});

module.exports = StockLoss;
