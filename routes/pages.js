const db = require("../dbConnection");

module.exports = function(app, passport) {

	//Home page
	app.get('/', function(req, res) {
		let query = "SELECT * FROM users u INNER JOIN seller s ON u.id=s.user_id";
		db.query(query, (err, row) => {
			if(err)
				console.log(err);
			if(row.length) { //If Seller
				res.render("index.ejs", {user: req.user, rest: row, isCustomer: false, status: false});
			} else {
				res.render("index.ejs", {user: req.user, isCustomer: true, status: false})
			}
		});
	});

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
		successRedirect : '/login',
		failureRedirect : '/register', // redirect back to the signup page if there is an error
		// session: false,
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
		let query = "SELECT * FROM users u NATURAL JOIN customer c WHERE c.user_id = ?";
		db.query(query, [req.user.id], (err, row) => {
			if(err)
				console.log(err);
			if(row.length) {
				res.render("profile.ejs", {user: req.user, isCustomer: true, status: true});
			} else {
				query = "SELECT i.id, name, price FROM (SELECT m.id FROM (SELECT s.id FROM users u NATURAL JOIN seller s WHERE s.user_id = ?) x NATURAL JOIN menu m) x INNER JOIN items i ON x.id = i.menu_id";
				db.query(query, [req.user.id], (err, row) => {
					if(err)
						console.log(err);
					if(row.length) {
						console.log(row);
						res.render("profile.ejs", {user: req.user, isCustomer: false, status: false, existingMenuItems: row});
					}
					else
						res.render("profile.ejs", {user: req.user, isCustomer: false, status: false});
				});
			}
		});
	});

	app.post("/profile/addItem", isLoggedIn, (req, res) => {
		let dishImg = req.files.dishimg1;
		let dishName = req.body.dish1;
		let dishPrice = req.body.dishprice1;
		var query = "SELECT m.id FROM (SELECT s.id FROM users u NATURAL JOIN seller s WHERE s.user_id = ?) x NATURAL JOIN menu m";
		dishImg.mv("./public/uploads/" + dishImg.name);
		db.query(query, [req.user.id], (err, row) => {
			if(err)
				console.log(err);
			query = "INSERT INTO items (menu_id, name, summary, type, price) VALUES (?,?,?,?,?)";
			db.query(query, [row[0].id, dishName, dishImg.name, "burger", dishPrice], (err, row) => {
				console.log(row)
				if(err)
					console.log(err);
				res.send({status: true});
			})
		});
	});

	app.get("/profile/removeItems/:id", isLoggedIn, (req, res) => {
		let itemId = req.params.id;
		var query = "DELETE FROM items where id = ?";
		db.query(query, [itemId], (err, row) => {
			if(err)
				console.log(err);
			else
				res.redirect("/profile");
		})
	});

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
// 	app.get("/restaurant", (req, res) => {
// 		let query = "SELECT * FROM users u NATURAL JOIN customer c WHERE c.user_id = ?";
// 		db.query(query, [req.user.id], (err, row) => {
// 			if(err)
// 				console.log(err);
// 			if(row.length) {
// 				res.render("restaurant.ejs", {user: req.user, isCustomer: true, status: false});
// 			} else {
// 				res.render("restaurant.ejs", {user: req.user, isCustomer: false, status: false})
// 			}
// 		});
// 	});

	//Restaurant page render
	app.get("/restaurant/:id", isLoggedIn,(req, res) => {
		let restId = req.params.id; 
		let query = "SELECT i.id, name, price, summary FROM (SELECT m.id FROM menu m INNER JOIN seller s ON s.id = m.rest_id WHERE s.id = ?) x INNER JOIN items i ON i.menu_id = x.id";
		db.query(query, [restId], (err, row) => {
			if(err)
				console.log(err);
			else
				console.log(row);
			if(row.length) {
				res.render("restaurant.ejs", {user: req.user, data: row});
			} else {
				res.redirect("/");
			}
		});
	});
};