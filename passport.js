var LocalStrategy = require('passport-local').Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
const dbconfig = require("./dbConnection");
var connection = mysql.createConnection(dbconfig.connection);
// connection.connect();
connection.query('USE ' + dbconfig.database);
// connection.end();


module.exports = function(passport) {

    //Login sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //Deserialize the user
    passport.deserializeUser(function(id, done) {
        // connection.connect();
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
        // connection.end();
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
            //Check if user exists
            // connection.connect();
            connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    // If user does not exist, create the user
                    var newUserMysql = {
                        email: email,
                        password: bcrypt.hashSync(password, null, null)
                    };

                    var insertQuery = "INSERT INTO users ( email, password ) values (?,?)";
                    // connection.connect();
                    connection.query(insertQuery,[newUserMysql.email, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;
                        return done(null, newUserMysql);
                    });
                    // connection.end();
                }
            });
            // connection.end();
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
            // connection.end();
        })
    );
};