const express = require("express");
const port = 3000;
const path = require("path");
const mysql = require("mysql");
const db = require("./dbConnection");
const cookieParser = require("cookie-parser");

const app = express();

db.connect((err, result) => {
	if(err)
		console.log(err);
	else {
		console.log("Connected to MySQL");
		var sql = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(100), password VARCHAR(255))";
		db.query(sql, (err, result) => {
			if(err)
				console.log(err);
			else
				console.log(result);
		});
	}
})

app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static('views'));
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

module.exports = db;

//Define Routes
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});