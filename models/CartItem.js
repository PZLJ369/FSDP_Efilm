const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const CartItem = db.define('cartitem', {
  ticketTitle: {
      type: Sequelize.STRING
  },
  ticketPrice: {
    type: Sequelize.INTEGER
  },
  MovieImgURL: {
    type: Sequelize.STRING
  },

});
module.exports = CartItem;