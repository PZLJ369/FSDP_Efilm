const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const CreditPay = db.define('creditpay', {
  cardNumber: {
      type: Sequelize.STRING
  },
  expiryDate: {
      type: Sequelize.DATE
  },
  cardHolder: {
      type: Sequelize.STRING
  },
});
module.exports = CreditPay;
