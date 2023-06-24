const LocalStrategy = require('passport-local').Strategy;



const connection = require("./database");

const bcrypt = require('bcrypt')

const saltRounds = 10



// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize auth out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
		done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
		done(null, user);
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'username',
        passwordField: 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

		// find a user whose username is the same as the forms username
		// we are checking to see if the user trying to login already exists
        connection.query("select * from auth where username = '"+username+"'",async (err,rows)=>{
			if (err)
                return done(err);
			 if (rows.length) {
                return done(null, false);
            } else {

				// if there is no user with that username
                // create the user
                var newUserMysql = new Object();
				
				newUserMysql.username = username;
      
                await bcrypt.hash(password, saltRounds).then(function(hash) {
                    newUserMysql.hash=hash
                });

			
				var insertQuery = "INSERT INTO auth ( username , hash ) values ('" + username +"','"+ newUserMysql.hash +"')";
				connection.query(insertQuery,function(err,rows){
				
				    return done(null, newUserMysql);
				});	
            }	
		});
    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, async (req, username, password, done) => {
        try {
            const rows = await new Promise((resolve, reject) => {
                connection.query("SELECT * FROM `auth` WHERE `username` = ?", [username],(err, rows) => {
                    resolve(rows);
                });
            });

            if (!rows.length) {
                // User not found
                return done(null, false);
            }
    
            const result = await bcrypt.compare(password, rows[0].hash);
            if (result) {
                // Authentication successful
                return done(null, rows[0]);
            } else {
                // Incorrect password
                return done(null, false);
            }
        } catch (err) {
            // Handle database or other errors
            return done(err);
        }
    }));
}