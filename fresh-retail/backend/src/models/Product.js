const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(50)
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'kg',
    comment: '计量单位: kg, 个, 斤, 份'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  stockQty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  shelfLife: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '保质期（天）'
  },
  minStock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '最低库存预警值'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1:在售 0:下架'
  },
  imageUrl: {
    type: DataTypes.STRING(500)
  }
});

module.exports = Product;
