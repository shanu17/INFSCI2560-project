const express = require("express");
const port = 3000;
const path = require("path");
const mysql = require("mysql");
const db = require("./dbConnection");
const cors = require("cors");
const fileUpload = require('express-fileupload');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var flash    = require('connect-flash');

const app = express();
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static('views'));
app.use(express.static(publicDirectory));

db.connect((err, result) => {
	if(err)
		console.log(err);
	else {
		console.log("Connected to MySQL");
		var sql = [];
		sql.push("CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(100) NOT NULL, password VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL)");
		sql.push("CREATE TABLE seller (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, category VARCHAR(255) NOT NULL, CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)");
		sql.push("CREATE TABLE customer (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, profile_img VARCHAR(255), CONSTRAINT fk_users_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)");
		sql.push("CREATE TABLE menu (id INT AUTO_INCREMENT PRIMARY KEY, rest_id INT NOT NULL, title VARCHAR(255) NOT NULL, summary VARCHAR(255), CONSTRAINT fk_rest_id FOREIGN KEY (rest_id) REFERENCES seller (id) ON DELETE CASCADE)");
		sql.push("CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT NOT NULL, rest_id INT NOT NULL, status BOOLEAN NOT NULL, total DECIMAL(7, 3) NOT NULL, CONSTRAINT fk_seller_id FOREIGN KEY (rest_id) REFERENCES seller (id) ON DELETE CASCADE, CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES customer (id))");
		sql.push("CREATE TABLE items (id INT AUTO_INCREMENT PRIMARY KEY, menu_id INT NOT NULL, name VARCHAR(255) NOT NULL, summary VARCHAR(255), type VARCHAR(255) NOT NULL, price DECIMAL(7, 3) NOT NULL, CONSTRAINT fk_menu_id FOREIGN KEY (menu_id) REFERENCES menu (id) ON DELETE CASCADE)");
		sql.push("CREATE TABLE order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, quantity INT NOT NULL, item_id INT NOT NULL, CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE, CONSTRAINT fk_item_id FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE)");
		sql.push("CREATE TABLE rating (rest_id INT PRIMARY KEY, rate INT NOT NULL, CONSTRAINT fk_rating_id FOREIGN KEY (rest_id) REFERENCES seller (id) ON DELETE CASCADE)");
		for (var i = 0; i < sql.length; i++) {
			db.query(sql[i], (err, result) => {
				if(err)
					console.log("Already created table");
				else
					console.log(result);
			});
		}
	}
});

require('./passport')(passport);

app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload({
    createParentPath: true
}));

app.use(session({
	secret: 'sanil25',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

//Routes
require('./routes/pages.js')(app, passport);

// app.use(express.urlencoded({extended: false}));
// app.use(express.json());

// module.exports = db;

//Define Routes
// app.use("/", require("./routes/pages"));
// app.use("/auth", require("./routes/auth"));


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
