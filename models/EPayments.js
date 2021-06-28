const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const eNetsPay = db.define('enetspay', {
  email: {
      type: Sequelize.STRING
  },
  password: {
      type: Sequelize.STRING
  },
});
module.exports = eNetsPay;