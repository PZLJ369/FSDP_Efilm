const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport = require('passport');

const mainRoute = require('./routes/main');
const userRoute = require('./routes/user'); // Added for user
const movieRoute = require('./routes/movie'); // Added for movie
const paymentsRoute = require('./routes/payments'); // Added for payments

const { formatDate } = require('./helpers/hbs');
const { radioCheck } = require('./helpers/hbs');

const MySQLStore = require('express-mysql-session');
const db = require('./config/db'); // db.js config file

// Messaging Libraries
const flash = require('connect-flash');
const FlashMessenger = require('flash-messenger');

const vidjotDB = require('./config/DBConnection');

vidjotDB.setUpDB(false);
const authenticate = require('./config/passport');
authenticate.localStrategy(passport);

const app = express();

app.engine('handlebars', exphbs({
	helpers: {
		formatDate: formatDate,
		radioCheck: radioCheck
	},
	defaultLayout: 'main' // Specify default views/layout/main.handlebar 
}));
app.set('view engine', 'handlebars');

// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride('_method'));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Express session middleware - uses MySQL to store session
app.use(session({
	key: 'vidjot_session',
	secret: 'tojiv',
	store: new MySQLStore({
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true,
		// How frequently expired sessions will be cleared; milliseconds:
		checkExpirationInterval: 900000,
		// The maximum age of a valid session; milliseconds:
		expiration: 900000,
	}),
	resave: false,
	saveUninitialized: false,
}));


// To store session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'vidjot_session',
	secret: 'tojiv',
	resave: false,
	saveUninitialized: false,
}));

// Initilize Passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());
app.use(FlashMessenger.middleware); // add this statement after flash()

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Place to define global variables - not used in practical 1
app.use(function (req, res, next) {
	next();
});

// Use Routes
app.use('/', mainRoute); 
app.use('/user', userRoute); // Added for user
app.use('/movie', movieRoute); // Added for movie
app.use('/payments', paymentsRoute); // Added for payments

const port = 5001;

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});