var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
const connection = require("./dbConnection");

module.exports = function(passport) {
    //Login sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //Deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });


    //Sign up
    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            console.log("func")
            //Check if user exists
            connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    // If user does not exist, create the user
                    var newUserMysql = { //For the insert query
                        name: req.body.name,
                        email: email,
                        password: bcrypt.hashSync(password, null, null),
                        address: req.body.address
                    };
                    var newUserMysql1 = { //For passport session
                        email: email,
                        password: bcrypt.hashSync(password, null, null),
                    }
                    var insertQuery = "INSERT INTO users ( name, email, password, address ) values (?,?,?,?)";
                    connection.query(insertQuery,[newUserMysql.name, newUserMysql.email, newUserMysql.password, newUserMysql.address],function(err, rows) {
                        newUserMysql1.id = rows.insertId;
                        if (err) {
                            console.log(err)
                        }
                        return done(null, newUserMysql1);
                    });
                }
            });
        })
    );

    //Sign up - Seller
    passport.use(
        'local-signup-seller',
        new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            //Check if user exists
            // connection.connect();
            connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    // If user does not exist, create the user
                    var newUserMysql1 = {
                        email: email,
                        password: bcrypt.hashSync(password, null, null)
                    };

                    var newUserMysql = {
                        name: req.body.restaurantname,
                        email: email,
                        password: bcrypt.hashSync(password, null, null),
                        address: req.body.address
                    };

                    var insertQuery = "INSERT INTO users ( name, email, password, address ) values (?,?,?,?)";
                    // var insertQuery = "INSERT INTO sellers ( email, password ) values (?,?)";
                    connection.query(insertQuery,[newUserMysql.name, newUserMysql.email, newUserMysql.password, newUserMysql.address],function(err, rows) {
                        newUserMysql1.id = rows.insertId;
                        return done(null, newUserMysql1);
                    });
                }
            });
        })
    );


    //Login
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            // connection.connect();
            connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                // if the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                
                //return the user
                return done(null, rows[0]);
            });
        })
    );
};