const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Movie = db.define('movie', {
	title: {
		type: Sequelize.STRING
	},
	description: {
		type: Sequelize.STRING(1000)
	},
	language: {
		type: Sequelize.STRING
	},
	genre: {
		type: Sequelize.STRING
	},
	
	subtitles: {
		type: Sequelize.STRING,
	},
	classification: {
		type: Sequelize.STRING
	},
	posterURL: {
		type: Sequelize.STRING(512),
	},
	dateRelease: {
		type: Sequelize.DATE
	},
	url: {
		type: Sequelize.STRING
	},
	ticketPrice: {
		type: Sequelize.STRING
	},
});

module.exports = Movie;
