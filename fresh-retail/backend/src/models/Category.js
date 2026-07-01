const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '父分类ID，0为顶级分类'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1:启用 0:禁用'
  }
});

module.exports = Category;
