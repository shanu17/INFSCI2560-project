const express = require("express");
const port = 3000;
const path = require("path");
const mysql = require("mysql");
const db = require("./dbConnection");
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

// db.connect((err, result) => {
// 	if(err)
// 		console.log(err);
// 	else {
// 		console.log("Connected to MySQL");
// 		var sql = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(100), password VARCHAR(255))";
// 		db.query(sql, (err, result) => {
// 			if(err)
// 				console.log(err);
// 			else
// 				console.log(result);
// 		});
// 	}
// })

require('./passport')(passport);

app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


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