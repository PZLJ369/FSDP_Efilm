const express = require('express');
const MySQLStore = require('express-mysql-session');
const router = express.Router();
const moment = require('moment');
const CreditPay = require('../models/CPayments');
const eNetsPay = require('../models/EPayments'); 


// enetsView Page
router.get('/enetsview', (req, res) => {
	res.render('payments/enetsview') // 
});

// creditView Page
router.get('/creditview', (req, res) => {
	res.render('payments/creditview') // 
});

// router.get('/creditview', (req, res) => {
// 	CreditPay.findAll({
// 			where: {
// 					cardHolder: req.user.name
// 			},
// 			raw: true
// 	})
// 			.then((creditpays) => {
// 					res.render('payments/creditview', {
// 							creditpays: creditpays
// 					});
// 			})
// 			.catch(err => console.log(err));
// });


// CreditPay Page
router.get('/creditpays', (req, res) => {
	res.render('payments/creditpays', {
	});
});

// Adds new payment from /payments/creditpays
router.post('/creditpays', (req, res) => {
	let cardNumber = req.body.cardNumber;
	let expiryDate = moment(req.body.expiryDate, 'DD/MM/YYYY');
	let cardHolder = req.body.cardHolder;
	CreditPay.create({
			cardNumber,
			expiryDate,
			cardHolder
	}).then((creditpays) => {
			res.redirect('/payments/creditview');
	}).catch(err => console.log(err))
});

// eNetsPay Page
router.get('/enetspays', (req, res) => {
	res.render('payments/enetspays', {
	});
});

// Adds new payment from /payments/creditpays
router.post('/enetspays', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	eNetsPay.create({
			email,
			password
	}).then((enetspays) => {
			res.redirect('/payments/enetsview');
	}).catch(err => console.log(err))
});

// router.post('/enetspays', (req, res) => {
// 	let errors = [];
// 	// Retrieves fields from register page from request body
// 	let { email, password } = req.body;

// 	// Checks that password length is more than 4
// 	if (password.length < 4) {
// 			errors.push({ text: 'Password must be at least 4 characters' });
// 	}
// 	if (errors.length > 0) {
// 			res.render('payments/enetspays', {
// 					errors,
// 					email,
// 					password
// 			});
// 	} else{
// 	// Create new record
// 	eNetsPay.create({ email, password })
// 	.then(payments => {
// 			alertMessage(res, payments.email + ' success', 'fas fa-sign-in-alt', true);
// 			res.redirect('/');
// 	})
// 	.catch(err => console.log(err));
// }
// });
module.exports = router;

