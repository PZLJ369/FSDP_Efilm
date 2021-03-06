const express = require('express');
const router = express.Router();
const User = require('../models/User');
const alertMessage = require('../helpers/messenger');
var bcrypt = require('bcryptjs');
const passport = require('passport');


// Login Form POST => /user/login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/', // Route to /video/listVideos URL
        failureRedirect: '/showLogin', // Route to /login URL
        failureFlash: true
    })(req, res, next);
});


// User register URL using HTTP post => /user/register
router.post('/register', (req, res) => {
    let errors = [];
    let { name, email, password, password2 } = req.body;
    if (password !== password2) {
        errors.push({ text: 'Passwords do not match' });
    }
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('user/register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    res.render('user/register', {
                        error: user.email + ' already registered',
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    // Encrypt the password
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            // Store hash in your password DB.
                            if (err) {
                                throw err;
                            } else {
                                password = hash;
                                // Create new user record
                                User.create({ name, email, password })
                                    .then(user => {
                                        alertMessage(res, 'success', user.name + ' added.Please login', 'fas fa-sign-in-alt', true);
                                        res.redirect('/showLogin');
                                    })
                                    .catch(err => console.log(err));
                            }
                        });
                    });
                }
            });
    }
});

module.exports = router;