const express = require("express");
const router = express.Router();

const passport = require('passport');
const passportConfig = require('../passport.js');

passportConfig(passport);

const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const User = mongoose.model("User");

const ThailandSchema = new mongoose.Schema({
    TambonThaiShort: String,
    DistrictThaiShort: String,
    ProvinceThai: String,
    PostCodeMain: Number,
  });
  


  const Thailand = mongoose.model("thailand", ThailandSchema);
  const Address = mongoose.model("Address");
  const Bank = mongoose.model("Bank");
  const Wallet = mongoose.model("Wallet");

  const getId = async (username) => {
    return await new Promise((resolve, reject) => {
      con.query(
        "SELECT * FROM users where username = ?",[username],
        (err, rows) => {
          resolve(rows[0]);
        }
      );
    });
  };

router.get("/login", (req, res) => {
    res.render("login");
  });
  
router.get("/register", async (req, res) => {
  
  const thailand = await Thailand.find({}).exec();
  const userNum = (await User.count()).toString().padStart(4, "0");
  res.render("register", {
    userNum: userNum,
    sponsor: null,
    thailand: thailand,
  });
});

router.post('/register', passport.authenticate('local-signup'), async (req, res) => {
    const temp = await getId(sponsortemp)
    if (!temp) {
      sponsortemp = null;
    }
  
    const newAddressQuery = `INSERT INTO addresses (address, subdistrict, district, city, postCode) 
                              VALUES (?, ?, ?, ?, ?)`;
    const newAddressValues = [
      req.body.address,
      req.body.subdistrict,
      req.body.district,
      req.body.city,
      req.body.postCode,
    ];
  
    connection.query(newAddressQuery, newAddressValues, (err, addressResult) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        const addressId = addressResult.insertId;
  
        const newBankQuery = `INSERT INTO banks (bank, bookBank, bookBankNumber, bookBankBranch) 
                              VALUES (?, ?, ?, ?)`;
        const newBankValues = [
          req.body.bank,
          req.body.bookBank,
          req.body.bookBankNumber,
          req.body.bookBankBranch,
        ];
  
        connection.query(newBankQuery, newBankValues, (err, bankResult) => {
          if (err) {
            console.log(err);
            res.redirect("/register");
          } else {
            const bankId = bankResult.insertId;
  
            const startWalletQuery = `INSERT INTO wallets (money, point, total) VALUES (?, ?, ?)`;
            const startWalletValues = [0, 0, 0];
  
            connection.query(startWalletQuery, startWalletValues, (err, walletResult) => {
              if (err) {
                console.log(err);
                res.redirect("/register");
              } else {
                const walletId = walletResult.insertId;
  
                const latestUserQuery = "SELECT * FROM users ORDER BY id DESC LIMIT 1";
                connection.query(latestUserQuery, (err, latestUserResult) => {
                  if (err) {
                    console.log(err);
                    res.redirect("/register");
                  } else {
                    const counttemp = latestUserResult[0].count + 1;
  
                    const newUserQuery = `INSERT INTO users 
                                          (username, fullName, addressId, citizen, phoneNumber, bankId, count, sponsor, walletId) 
                                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    const newUserValues = [
                      req.body.username,
                      req.body.fullName,
                      addressId,
                      req.body.citizen,
                      req.body.phoneNumber,
                      bankId,
                      counttemp,
                      sponsortemp,
                      walletId,
                    ];
  
                    connection.query(newUserQuery, newUserValues, (err, userResult) => {
                      if (err) {
                        console.log(err);
                        res.redirect("/register");
                      } else {
                        // User registered successfully
                        res.redirect("/mlm");
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
});


router.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log(user)
            // Handle authentication failure
            return res.redirect("/login");
        }
        // Authentication successful
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Redirect to the homepage
            return res.redirect("/");
        });
    })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      // Handle any error that occurred during logout
      console.error(err);
      // Optionally, send an error response to the client
      res.status(500).send('Logout failed');
    } else {
      // Logout was successful
      // Optionally, send a success response to the client
      res.redirect('/')
    }
  });
});

  

module.exports = router;