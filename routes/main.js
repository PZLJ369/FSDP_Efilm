const express = require('express');
const MySQLStore = require('express-mysql-session');
const router = express.Router();
const moment = require('moment');
const alertMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');
const PayHistory = require('../models/PayHistory');
const CartItem = require('../models/CartItem');
const Movie = require('../models/Movie');
const title = 'ElectronicFilm'; 

router.get('/', (req, res) => {
	// display movies created on home page
	Movie.findAll({
		raw: true,
		nest: true
	}).then((movies) => {
		if (req.isAuthenticated()) {
			CartItem.findAll({
				where: {userId: req.user.id},
				raw: true
		})
				.then((cartitem) => {
						res.render('index', {
							cartitem: cartitem, 
							movies: movies,
							title: title
						});
				}).catch(err => console.log(err));
		}else{
			res.render('index', {
				movies: movies,
				title: title
			});
		}
		}).catch(err => console.log(err));
});


// Add movie items to Cart.
router.post('/', (req, res) => {
	let ticketTitle = req.body.ticketTitle;
	let ticketPrice = req.body.ticketPrice;
	let MovieImgURL = req.body.MovieImgURL;
	// only add same item once
	if (req.isAuthenticated()) {
		let userId = req.user.id;
		CartItem.findOne({ where: { userId: req.user.id, ticketTitle: req.body.ticketTitle  }})
		.then(cartitem =>{
			if (cartitem){
				Movie.findAll({
					raw: true
				}).then((movies) => {
					res.render('index', {
						error: '"'+ticketTitle+'"' + ' already added to your cart',
						ticketTitle,
						ticketPrice,
						MovieImgURL,
						userId,
						movies: movies,
						title: title
					});
				})
			}else{
				CartItem.create({
				ticketTitle,
				ticketPrice,
				MovieImgURL,
				userId
				}).then((cartitem) => {
					res.redirect('/cart');
				}).catch(err => console.log(err));
			}
		})
	}else{
		Movie.findAll({
			raw: true
		}).then((movies) => {
			res.render('index', {
				error: ' Please Login before booking a ticket',
				movies: movies,
				title: title
			});
		})
	}
});

// Cart Page
router.get('/cart', ensureAuthenticated, (req, res) => {
	CartItem.findAll({
			where: {
					userId: req.user.id
			},
			order: [
					['id', 'DESC']
			],
			raw: true
	})
			.then((cartitem) => {
					res.render('cart', {
						cartitem: cartitem
					});
			})
			.catch(err => console.log(err));
});


// Adds new payment to /payments/creditpays
router.post('/cart', ensureAuthenticated, (req, res) => {
	let errors = [];
	let ticketTitle = req.body.ticketTitle;
	let ticketNumber = req.body.ticketNumber;
	let ticketDate = moment(req.body.ticketDate, 'YYYY-MM-DD');
	let userId = req.user.id;
	
	if (ticketNumber < 1){
		errors.push({ text: 'Please purchase at least 1 ticket'});
	}
	if (!ticketDate.isValid()){
		errors.push({text: 'Please enter a valid date'});
	}

	if (errors.length > 0){
		res.render('cart', {
			errors,
			ticketTitle,
			ticketNumber, 
			ticketDate,
			userId
		});
	}else{
		PayHistory.create({
			ticketTitle,
			ticketNumber,
			ticketDate,
			userId
			}).then((payhistory) => {
					res.redirect('/seats');
			}).catch(err => console.log(err));
	}
});

// remove item in cart
router.get('/remove/:id', ensureAuthenticated, (req, res) => {
	
	CartItem.findOne({
		where: {
			id: req.params.id,
			userId: req.user.id
		},
		attributes: ['id', 'userId']
	}).then((cartitem) => {

		if (cartitem != null) {
			CartItem.destroy({
				where: {
					id: req.params.id
				}
			}).then(() => {
				alertMessage(res, 'info', cartitem.ticketTitle + ' is removed from your cart', 'far fa-trash-alt', true);
				res.redirect('/cart'); 
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
			res.redirect('/logout');
		}
	});
});

// play trailer for individual movies
router.get('/showtrailer/:id', (req, res) => {
	Movie.findOne({
		where: {id: req.params.id},
		raw: true,
		nest: true
	}).then((movies) => {
		if (movies != null) {
			if (movies.url != null){
				res.render('tailer', {
					movies: movies
				});
			}else{
				res.render('tailer', {
					error: '"'+movies.title+'"' + ' does not have trailer'
				});
			}
		} else {
			res.redirect('/');
		}
	}).catch(err => console.log(err));
});

// Seating Page
router.get('/seats', (req , res) => {
	PayHistory.findOne({
		where: {userId: req.user.id},
		order: [['id', 'DESC']],
		raw: true
	}).then((payhistory) => {
		let ticketTitle = payhistory.ticketTitle;
		let ticketNumber = payhistory.ticketNumber;
		if (payhistory != null) {
			res.render('seats', {
				payhistory: payhistory,
				ticketTitle: ticketTitle,
				ticketNumber: ticketNumber
			});
		}else{
			res.redirect('/');
		}
	}).catch(err => console.log(err))
})

// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// Login Page
router.get('/showLogin', (req, res) => {
	res.render('user/login') // 
});

// Register Page
router.get('/showRegister', (req, res) => {
	res.render('user/register') // 
});

// About Page
router.get('/about', (req, res) => {
	let pDeveloperName = "Group4";
	res.render('about', {
		developerName: pDeveloperName
	}) 
});


module.exports = router;
