const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const CreditPay = db.define('creditpay', {
    cardNumber: {
        type: Sequelize.STRING
    },
    expiryDate: {
        type: Sequelize.DATE
    },
    cvv:{
        type: Sequelize.INTEGER
    },
    cardHolder: {
        type: Sequelize.STRING
    },
    ticketTitle:{
        type: Sequelize.STRING
    },
    ticketNumber: {
        type: Sequelize.INTEGER
    },
    totalPrice:{
        type: Sequelize.DOUBLE
    },
    VerificationCode:{
        type: Sequelize.INTEGER
    },

});
module.exports = CreditPay;