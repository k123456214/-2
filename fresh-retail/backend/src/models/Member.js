const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '会员等级ID'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  storeId: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1:正常 0:禁用'
  }
});

module.exports = Member;
