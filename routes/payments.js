const express = require('express');
const MySQLStore = require('express-mysql-session');
const router = express.Router();
const moment = require('moment');
const alertMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');
const CreditPay = require('../models/CPayments');
const PayHistory = require('../models/PayHistory');
const CartItem = require('../models/CartItem');

// Pay by credit card
router.post('/creditpays', ensureAuthenticated, (req, res) => {
	let errors = [];
	let cardNumber = req.body.cardNumber;
	let expiryDate = moment(req.body.expiryDate, 'DD/MM/YYYY');
	let cvv = req.body.cvv;
	let cardHolder = req.body.cardHolder;
	let userId = req.user.id;

	PayHistory.findOne({
		where: {userId: req.user.id},
		order: [['id', 'DESC']],
		raw: true
	}).then((payhistory) => { 
		let ticketTitle = payhistory.ticketTitle;
		if (payhistory != null){
			CartItem.findOne({
				where: {
						userId: req.user.id,
						ticketTitle: ticketTitle
				},
				order: [['id', 'DESC']],
				raw: true
			})
				.then((cartitem) => {
						// Derive columns
						let ticketTitle = cartitem.ticketTitle;
						let ticketNumber = payhistory.ticketNumber;
						let totalPrice = cartitem.ticketPrice * payhistory.ticketNumber;
						let VerificationCode = 127853 + payhistory.id;
						if (cvv.length != 3){
							errors.push({ text: 'Please enter a valid CVV code'});
						}
						if(cardNumber.length != 16){
							errors.push({ text: 'Please enter a valid credit card number'});
						}
						if (errors.length > 0){
							res.render('payments/creditpays', {
								errors:errors,
								payhistory: payhistory,
								cartitem: cartitem,
								totalPrice: totalPrice,
								VerificationCode: VerificationCode,
								userId
							});
					
						}else{
							CreditPay.create({
								cardNumber,
								expiryDate,
								cvv,
								cardHolder,
								ticketTitle,
								ticketNumber,
								totalPrice,
								VerificationCode,
								userId
							}).then((creditpays) => {
									res.redirect('/payments/creditview');
							}).catch(err => console.log(err))
						}
				})
				.catch(err => console.log(err));
		}else{
			res.redirect('/cart');
		}
	})
});

// CreditPay Page
router.get('/creditpays', ensureAuthenticated, (req, res) => {
	// Dsiplay movie name, number of ticket and totalPrice on payment page
	PayHistory.findOne({
		where: {userId: req.user.id},
		order: [['id', 'DESC']],
		raw: true
	}).then((payhistory) => { 
		let ticketTitle = payhistory.ticketTitle;
		if (payhistory != null){
			CartItem.findOne({
				where: {
						userId: req.user.id,
						ticketTitle: ticketTitle
				},
				order: [['id', 'DESC']],
				raw: true
			})
				.then((cartitem) => {
						let totalPrice = cartitem.ticketPrice * payhistory.ticketNumber;
						res.render('payments/creditpays', {
							payhistory: payhistory,
							cartitem: cartitem,
							totalPrice: totalPrice
						});
				})
				.catch(err => console.log(err));
		}else{
			res.redirect('/cart');
		}
	})
});


// creditView Page
router.get('/creditview', ensureAuthenticated, (req, res) => {

	CreditPay.findOne({
		where: {userId: req.user.id},
		order: [['id', 'DESC']],
		raw: true
	}).then((creditpay) => {

			if (creditpay != null){
				res.render('payments/creditview', {  
					creditpay: creditpay
				});
			}else{
				alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
				res.redirect('/logout');
			}

	}).catch(err => console.log(err));

});

// remove payhistory record if the payment is cancelled
router.get('/removeifCancel/:id', ensureAuthenticated, (req, res) => {
	
	PayHistory.findOne({
		where: {
			id: req.params.id,
			userId: req.user.id
		},
		attributes: ['id', 'userId']
	}).then((payhistory) => {

		if (payhistory != null) {
			PayHistory.destroy({
				where: {
					id: req.params.id
				}
			}).then(() => {
				res.redirect('/cart'); 
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
			res.redirect('/logout');
		}
	});
});

// after payment sucessful, delete item in cart
router.get('/paySucDelCart', ensureAuthenticated, (req, res) => {
	
	CreditPay.findOne({
		where: {userId: req.user.id},
		order: [['id', 'DESC']],
		raw: true
	}).then((creditpay) => {
		let ticketTitle = creditpay.ticketTitle;
			if (creditpay != null){
				CartItem.destroy({
					where: {userId: req.user.id,
							    ticketTitle: ticketTitle}
				}).then((cartitem) => {
					res.redirect('/');
				}).catch(err => console.log(err));
			}else{
				alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
				res.redirect('/logout');
			}

	}).catch(err => console.log(err));
});



module.exports = router;

