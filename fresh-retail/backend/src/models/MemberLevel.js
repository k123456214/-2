const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberLevel = sequelize.define('MemberLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  minPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  discountRate: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00,
    comment: '折扣率，1.00为无折扣'
  },
  pointsMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00,
    comment: '积分倍率'
  }
});

module.exports = MemberLevel;
