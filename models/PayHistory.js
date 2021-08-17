const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const PayHistory = db.define('payhistory', {
  ticketTitle: {
      type: Sequelize.STRING
  },
  ticketNumber: {
    type: Sequelize.INTEGER
  },
  ticketDate: {
      type: Sequelize.DATE
  },
});
module.exports = PayHistory;
