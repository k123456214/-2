const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNo: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1:待审核 2:已审核 3:采购中 4:已完成 5:已取消'
  },
  expectedDate: {
    type: DataTypes.DATE
  },
  remark: {
    type: DataTypes.STRING(500)
  }
});

module.exports = PurchaseOrder;
