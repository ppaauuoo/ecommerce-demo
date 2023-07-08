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
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
      }, function(req, username, password, done) {
        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        new Promise((resolve, reject) => {
          connection.query("SELECT * FROM auth WHERE username = ?", [username], (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        })
        .then(rows => {
          if (rows.length) {
            // User with the provided username already exists
            return done(null, false);
          } else {
            // Create the user
            const newUserMysql = {
              username: username
            };
      
            return bcrypt.hash(password, saltRounds)
              .then(hash => {
                newUserMysql.hash = hash;
                const insertQuery = "INSERT INTO auth (username, hash) VALUES (?, ?)";
                return new Promise((resolve, reject) => {
                  connection.query(insertQuery, [username, newUserMysql.hash], (err, rows) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(newUserMysql);
                    }
                  });
                });
              })
              .then(newUser => {
                return done(null, newUser);
              });
          }
        })
        .catch(err => {
          return done(err);
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
              connection.query("SELECT * FROM auth WHERE username = ?", [username], (err, rows) => {
                  if (err) {
                      reject(err); // Reject the promise in case of an error
                  } else {
                      resolve(rows); // Resolve the promise with the query result
                  }
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