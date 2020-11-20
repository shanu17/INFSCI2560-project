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

	//Home page
	app.get('/', function(req, res) {
		res.render('index', { user: req.user });
	});

	// app.get('/', isAuthenticated, function(req, res) {
	// 	res.render('indexuser', { user: req.user });
	// });

	// function isAuthenticated(req, res, next) {
	// 	if (req.isAuthenticated())
	// 		return next();
	// 	else{
	// 		res.render('index.ejs')
	// 	}
	// }


	//Login
	app.get('/login', isAuthLogin, function(req, res) {
		res.redirect('/profile');
	});

	function isAuthLogin(req, res, next) {
		if (req.isAuthenticated())
			return next();
		else{
			res.render('login.ejs')
		}
	}

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


	//Sign up - User
	app.get('/register', isAuthReg, function(req, res) {
		res.redirect('/profile');
	});

	function isAuthReg(req, res, next) {
		if (req.isAuthenticated())
			return next();
		else{
			res.render('register.ejs')
		}
	}

	app.post('/register', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/register', // redirect back to the signup page if there is an error
		failureFlash : true
	}), (res,req) => {
		console.log("success")
	});



	//Sign up - Seller
	app.get('/register_seller', isAuthRegSeller, function(req, res) {
		res.redirect('/profile');
	});

	function isAuthRegSeller(req, res, next) {
		if (req.isAuthenticated())
			return next();
		else{
			res.render('register_seller.ejs')
		}
	}

	app.post('/register_seller', passport.authenticate('local-signup-seller', {
		successRedirect : '/profile',
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

	// app.get('/sellerprofile', isLoggedIn, function(req, res) {
	// 	res.render('sellerprofile.ejs', {
	// 		user : req.user
	// 	});
	// });

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();
		else {
			res.redirect('/');
		}
	}


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