// const express = require("express");

// const router = express.Router();

// router.get("/", (req, res) => {
// 	res.render("index");
// });

// router.get("/register", (req, res) => {
// 	res.render("register");
// });
// router.get("/login", (req, res) => {
// 	res.render("login");
// });
// router.get("/profile", (req, res) => {
// 	res.render("profile");
// });
// router.get("/cart", (req, res) => {
// 	res.render("cart");
// });
// module.exports = router;

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	//Login
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	//Sign up
	app.get('/register', function(req, res) {
		res.render('register.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/register', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/register', // redirect back to the signup page if there is an error
		failureFlash : true
	}), (res,req) => {
		console.log("success")
	});

	//Sign up - Seller
	app.get('/register_seller', function(req, res) {
		res.render('register_seller.ejs', { message: req.flash('signupMessage_seller') });
	});

	app.post('/register', passport.authenticate('local-signup-seller', {
		successRedirect : '/profile_seller',
		failureRedirect : '/register_seller', // redirect back to the signup page if there is an error
		failureFlash : true
	}), (res,req) => {
		console.log("success")
	});
	
	//Profile
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

	//Logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	//Cart render
	app.get("/cart", (req, res) => {
		res.render("cart");
	});
};

// route middleware
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session-
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}