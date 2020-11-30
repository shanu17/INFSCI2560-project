const db = require("../dbConnection");
const util = require('util');

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
			res.render('login.ejs', { message: req.flash('loginMessage')});
		}
	}

	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/',
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true
		}),
        function(req, res) {
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
			res.render('register.ejs', { message: req.flash('signupMessage')})
		}
	}

	app.post('/register', passport.authenticate('local-signup', {
		successRedirect : '/login',
		failureRedirect : '/register', // redirect back to the signup page if there is an error
		// session: false,
		failureFlash : true
	}), (res,req) => {
	});



	//Sign up - Seller
	app.get('/register_seller', isAuthRegSeller, function(req, res) {
		res.redirect('/profile');
	});

	function isAuthRegSeller(req, res, next) {
		if (req.isAuthenticated())
			return next();
		else{
			res.render('register_seller.ejs', { message: req.flash('signupMessage')})
		}
	}

	app.post('/register_seller', passport.authenticate('local-signup-seller', {
		successRedirect : '/',
		failureRedirect : '/register_seller', // redirect back to the signup page if there is an error
		failureFlash : true
	}), (res,req) => {
	});


	//Profile
	app.get('/profile', isLoggedIn, async function(req, res) {
		let query = "SELECT c.id FROM users u INNER JOIN customer c ON u.id = c.user_id WHERE c.user_id = ?"; // checking if he is a customer
		let pendingData = [];
		let oldData = [];
		console.log(req.user.name);
		if(req.user.name !== "admin") {
			db.query(query, [req.user.id], async (err, row) => {
				if(err)
					console.log(err);
				if(row.length) {
					let customerId = row[0].id;
					query = "SELECT rest_id, total FROM orders WHERE customer_id = ? AND status = ?";
					try{
						let [rows, fields] = await db.promise().query(query, [customerId, 0]);
						let o = rows;
						if(rows.length) {
							for(var i = 0; i < rows.length; i++) {
								let restId = o[i].rest_id
								let total = o[i].total;
								query = "SELECT name FROM users u INNER JOIN seller s ON u.id = s.user_id WHERE s.id = ?";
								let [rows, fields] = await db.promise().query(query, [restId]);
								let order = {"rest_name": rows[0].name, "total": total};
								pendingData.push(order);
							}
						}
					} catch(err) {
						console.log(err);
					}
					query = "SELECT rest_id, total FROM orders WHERE customer_id = ? AND status = ?";
					try {
						let [rows, fields] = await db.promise().query(query, [customerId, 1]);
						let o = rows;
						if(rows.length) {
							for(var i = 0; i < rows.length; i++) {
								let restId = o[i].rest_id
								let total = o[i].total;
								query = "SELECT name FROM users u INNER JOIN seller s ON u.id = s.user_id WHERE s.id = ?";
								let [rows, fields] = await db.promise().query(query, [restId]);
								let order = {"rest_name": rows[0].name, "total": total};
								oldData.push(order);
							}
						}
					} catch(err) {
						console.log(err);
					}
					res.render("profile.ejs", {user: req.user, isCustomer: true, status: false, pendingOrders: pendingData, oldOrders: oldData});
				} else {
					query = "SELECT i.id, name, price FROM (SELECT m.id FROM (SELECT s.id FROM users u INNER JOIN seller s ON u.id = s.user_id WHERE s.user_id = ?) x INNER JOIN menu m ON m.rest_id = x.id) y INNER JOIN items i ON y.id = i.menu_id";
					try {
						let [rows, fields] = await db.promise().query(query, [req.user.id]);
						let menuItems = rows;
						query = "SELECT id FROM seller WHERE user_id = ?";
						let [rows2, fields2] = await db.promise().query(query, [req.user.id]);
						query = "SELECT order_id, total, item_id, i.name as item_name, quantity, a.name, address FROM (SELECT order_id, total, item_id, quantity, name, address FROM (SELECT y.order_id, total, item_id, quantity, user_id FROM (SELECT ot.order_id, customer_id, total, item_id, quantity FROM (SELECT * FROM orders WHERE rest_id = ? AND status = ?) o INNER JOIN order_items ot ON o.id = ot.order_id) y INNER JOIN customer c ON y.customer_id = c.id) z INNER JOIN users u ON u.id = z.user_id) a INNER JOIN items i ON a.item_id = i.id;"
						let [rows3, fields3] = await db.promise().query(query, [rows2[0].id, 0]);
						let existingOrders = rows3;
						let final = [];
						let orderArray = [];
						for(var i = 0; i<existingOrders.length; i++) {
							let orderId = existingOrders[i].order_id;
							let k = [];
							if(!orderArray.includes(orderId)) {
								for(var j = 0; j<existingOrders.length; j++) {
									if(orderId == existingOrders[j].order_id) {
										k.push(existingOrders[j]);
									}
								}
								final.push(k);
								orderArray.push(orderId);
							}
						}
						query = "SELECT SUM(total) AS earning FROM orders WHERE status = ? AND rest_id = ?"
						let [rows4, fields4] = await db.promise().query(query, [rows2[0].id, 1]);
						res.render("profile.ejs", {user: req.user, isCustomer: false, status: false, existingMenuItems: menuItems, pendingOrders: final, total: rows4[0].earning});
					} catch(err) {
						console.log(err);
					}
				}
			});
		} else {
			query = "SELECT u.id, u.name, u.email, u.address FROM users u INNER JOIN customer c ON c.user_id = u.id WHERE u.name <> ?"
			let [rows, fields] = await db.promise().query(query, ["admin"]);
			let customerData = rows;
			query = "SELECT u.id, u.name, u.email, u.address, s.category FROM users u INNER JOIN seller s ON s.user_id = u.id";
			[rows, fields] = await db.promise().query(query);
			let sellerData = rows;
			res.render("profile.ejs", {user: req.user, isCustomer: true, status: false, isAdmin: true, customer: customerData, seller: sellerData});
		}
	});

	app.post("/profile/addItem", isLoggedIn, (req, res) => {
		let dishImg = req.files.dishimg1;
		let dishName = req.body.dish1;
		let dishPrice = req.body.dishprice1;
		var query = "SELECT m.id FROM (SELECT s.id FROM users u INNER JOIN seller s ON u.id = s.user_id WHERE s.user_id = ?) x INNER JOIN menu m ON m.rest_id = x.id";
		dishImg.mv("./public/uploads/" + dishImg.name);
		db.query(query, [req.user.id], (err, row) => {
			if(err)
				console.log(err);
			query = "INSERT INTO items (menu_id, name, summary, type, price) VALUES (?,?,?,?,?)";
			db.query(query, [row[0].id, dishName, dishImg.name, "burger", dishPrice], (err, row) => {
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

	app.get("/profile/sendorder/:id", isLoggedIn, async (req, res) => {
		console.log(req.params.id);
		let query = "UPDATE orders SET status = ? WHERE id = ?";
		try {
			let [rows, fields] = await db.promise().query(query, [1, req.params.id]);
			res.redirect("/profile");
		} catch(err) {
			console.log(err);
		}
	});

	app.get("/profile/delUser/:id", isLoggedIn, async (req, res) => {
		let userId = req.params.id;
		let query = "DELETE FROM users WHERE id=?";
		try {
			let [rows, fields] = await db.promise().query(query, [userId]);
			res.redirect("/profile");
		} catch(err) {
			console.log(err);
		}
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
	app.get("/restaurant/:id", isLoggedIn, (req, res) => {
		let restId = req.params.id;
		let query = "SELECT i.id, name, price, summary FROM (SELECT m.id FROM menu m INNER JOIN seller s ON s.id = m.rest_id WHERE s.id = ?) x INNER JOIN items i ON i.menu_id = x.id";
		db.query(query, [restId], (err, row) => {
			if(err)
				console.log(err);
			if(row.length) {
				res.render("restaurant.ejs", {user: req.user, data: row, rest_id: restId});
			} else {
				res.redirect("/");
			}
		});
	});

	// Restaurant order
	app.post("/restaurant/:id/orders", isLoggedIn, (req, res) => {
		let restId = req.params.id;
		let items = req.body;
		let userId = req.user.id;
		let query = "SELECT c.id FROM users u INNER JOIN customer c ON c.user_id = u.id WHERE u.id=?";
		db.query(query, [userId], (err, row) => {
			if(err)
				console.log(err);
			let customerId = row[0].id;
			query = "INSERT INTO orders (customer_id, rest_id, status, total) VALUES (?, ?, ?, ?)";
			db.query(query, [customerId, restId, 0, items[items.length-1]], (err, row) => {
				if(err)
					console.log(err);
				let orderId = row.insertId;
				for(var i = 0; i < items.length - 1; i++) {
					query = "SELECT id FROM items WHERE name=?";
					let title = items[i].item_title;
					let q = items[i].quantity;
					console.log(title);
					console.log(q);
					db.query(query, [items[i].item_title], (err, row) => {
						if(err)
							console.log(err);
						let itemId = row[0].id;
						query = "INSERT INTO order_items (order_id, quantity, item_id) VALUES (?, ?, ?)";
						db.query(query, [orderId, q, itemId], (err, row) => {
							if(err)
								console.log(err)
							else
								return res.send({status: true});
						})
					});
				}
			});
		});
	});
};