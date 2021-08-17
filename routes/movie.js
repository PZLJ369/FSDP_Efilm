const express = require('express');
const MySQLStore = require('express-mysql-session');
const router = express.Router();
const moment = require('moment');
const Movie = require('../models/Movie');
// Flash Messegner
const alertMessage = require('../helpers/messenger');

const ensureAuthenticated = require('../helpers/auth');

// Required for file upload
const fs = require('fs');
const upload = require('../helpers/imageUpload');


// Upload poster
router.post('/upload', ensureAuthenticated, (req, res) => {
	// Creates user id directory for upload if not exist
	if (!fs.existsSync('./public/uploads/' + req.user.id)){
		fs.mkdirSync('./public/uploads/' + req.user.id);
	}
	
	upload(req, res, (err) => {
		if (err) {
			res.json({file: '/img/no-image.jpg', err: err});
		} else {
			if (req.file === undefined) {
				res.json({file: '/img/no-image.jpg', err: err});
			} else {
				res.json({file: `/uploads/${req.user.id}/${req.file.filename}`});
			}
		}
	});
})

// List movies belonging to current logged in user
router.get('/listMovies', ensureAuthenticated, (req, res) => {
	Movie.findAll({
		where: {
			userId: req.user.id
		},
		order: [
			['title', 'ASC']
		],
		raw: true
	})
	.then((movies) => {
		// pass object to listMovies.handlebar
		res.render('movie/listMovies', { 
			movies: movies
		});
	})
	.catch(err => console.log(err));
});


router.get('/movieMenu', ensureAuthenticated, (req, res) => {
	Movie.findAll({
		where: {
			userId: req.user.id
		},
		order: [
			['title', 'ASC']
		],
		raw: true
	})
	.then((movies) => {
		// pass object to listMovies.handlebar
		res.render('movie/movieMenu', { 
			movies: movies
		});
	})
	.catch(err => console.log(err));
});

router.get('/viewMovie', ensureAuthenticated, (req, res) => {
	Movie.findAll({
		where: {
			userId: req.user.id
		},
		order: [
			['title', 'ASC']
		],
		raw: true
	})
	.then((movies) => {
		// pass object to listMovies.handlebar
		res.render('movie/viewMovie', { 
			movies: movies
		});
	})
	.catch(err => console.log(err));
});


router.get('/calander', ensureAuthenticated, (req, res) => {
	Movie.findAll({
		where: {
			userId: req.user.id
		},
		order: [
			['title', 'ASC']
		],
		raw: true
	})
	.then((movies) => {
		// pass object to listMovies.handlebar
		res.render('movie/calander', { 
			movies: movies
		});
	})
	.catch(err => console.log(err));
});

// Shows add movie page
router.get('/showAddMovie', ensureAuthenticated, (req, res) => {
	res.render('movie/addmovie');
});

router.get('/movieMenu', ensureAuthenticated, (req, res) => {
	res.render('movie/movieMenu');
});

router.get('/viewMovie', ensureAuthenticated, (req, res) => {
	res.render('movie/viewMovie');
});


// Shows edit movie page
/* router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Movie.findOne({
		where: {
			id: req.params.id
		}
	}).then((movie) => {
		if (!movie) { // check movie first because it could be null.
			alertMessage(res, 'info', 'No such movie', 'fas fa-exclamation-circle', true);
			res.redirect('/movie/listMovies');
		} else {
			// Only authorised user who is owner of movie can edit it
			if (req.user.id === movie.userId) {
				checkOptions(movie);
				res.render('movie/editMovie', { // call views/movie/editMovie.handlebar to render the edit movie page
					movie
				});
			} else {
				alertMessage(res, 'danger', 'Unauthorised access to movie', 'fas fa-exclamation-circle', true);
				res.redirect('/logout');
			}
		}
	}).catch(err => console.log(err)); // To catch no movie ID
}) */
router.get('/edit/:id', (req, res) => {
	Movie.findOne({
	where: {
	id: req.params.id
	}
	}).then((movie) => {
	 // call views/movie/editMovie.handlebar to render the edit movie page
	res.render('movie/editMovie', {
	movie // passes movie object to handlebar
	});
	}).catch(err => console.log(err)); // To catch no movie ID
	});


// Adds new movie jot from /movie/addMovie
router.post('/addMovie', ensureAuthenticated, (req, res) => {
	let title = req.body.title;
	let description = req.body.description;
	let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
	let subtitles = req.body.subtitles === undefined ? '' : req.body.subtitles.toString();
	let classification = req.body.classification;
	let genre = req.body.genre;
	let url = req.body.url;
	let userId = req.user.id;
	let posterURL = req.body.posterURL;
	let ticketPrice = req.body.ticketPrice;


	// Multi-value components return array of strings or undefined
	Movie.create({
		title,
		description,
		classification,
		genre,
		subtitles,
		dateRelease,
		url,
		posterURL,
		userId,
		ticketPrice,


	}).then((movie) => {
		res.redirect('/movie/listMovies'); // redirect to call router.get(/listMovies...) to retrieve all updated
		// movies
	}).catch(err => console.log(err))
});

// save edited movie
router.put('/saveEditedMovie/:id', ensureAuthenticated, (req, res) => {
	let title = req.body.title;
	let description = req.body.description;
	let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
	let subtitles = req.body.subtitles === undefined ? '' : req.body.subtitles.toString();
	let classification = req.body.classification;
	let genre = req.body.genre;
	let url = req.body.url;
	let userId = req.user.id;
	let posterURL = req.body.posterURL;
	let ticketPrice = req.body.ticketPrice;



	/* console.log(`\n++++++++ Movie from session: ${req.session.movie.title}`);
	 console.log(`\n++++++++ All movies from session: ${req.session.allMovies}`); */
	console.log(`URL: ${posterURL}`);
	Movie.update({
		title,
		description,
		classification,
		genre,
		subtitles,
		dateRelease,
		url,
		posterURL,
		userId,
		ticketPrice,

	}, {
		where: {
			id: req.params.id
		}
	}).then(() => {
		res.redirect('/movie/listMovies'); // redirect to call router.get(/listMovies...) to retrieve all updated
			// movies
	}).catch(err => console.log(err));
});


router.get('/delete/:id', ensureAuthenticated, (req, res) => {
	let movieId = req.params.id;
	let userId = req.user.id;
	// Select * from movies where movies.id=movieID and movies.userId=userID
	Movie.findOne({
		where: {
			id: movieId,
			userId: userId
		},
		attributes: ['id', 'userId']
	}).then((movie) => {
		// if record is found, user is owner of movie
		if (movie != null) {
			Movie.destroy({
				where: {
					id: movieId
				}
			}).then(() => {
				alertMessage(res, 'info', 'Movie Jot deleted', 'far fa-trash-alt', true);
				res.redirect('/movie/listMovies'); // To retrieve all movies again
			}).catch(err => console.log(err));
		} else {
			alertMessage(res, 'danger', 'Unauthorised access to movie', 'fas fa-exclamation-circle', true);
			res.redirect('/logout');
		}
	});
});



module.exports = router;