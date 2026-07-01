const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
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
  memberId: {
    type: DataTypes.INTEGER
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  payAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  payStatus: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0:未支付 1:已支付 2:退款中 3:已退款'
  },
  payMethod: {
    type: DataTypes.STRING(20),
    comment: '支付方式: cash, wechat, alipay, card, balance'
  },
  deliveryType: {
    type: DataTypes.STRING(20),
    defaultValue: 'offline',
    comment: '配送方式: offline(到店), delivery(配送), pickup(自提)'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1:待处理 2:进行中 3:已完成 4:已取消'
  },
  type: {
    type: DataTypes.STRING(20),
    defaultValue: 'offline',
    comment: '订单类型: online, offline'
  },
  remark: {
    type: DataTypes.STRING(500)
  }
});

module.exports = Order;
