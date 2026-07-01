const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/freshRetail.db'),
  logging: false,
  define: {
    underscored: true,
    freezeTableName: true
  }
});

module.exports = sequelize;
