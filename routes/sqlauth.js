const express = require("express");
const router = express.Router();

const passport = require("passport");
const passportConfig = require("../passport.js");

const https = require('https')

passportConfig(passport);

const sql = require("../helper/sqlCommand.js");







router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", async (req, res) => {
  const thailand = await sql.queryPromise("SELECT * FROM thailands")
  var userNum = await sql.getLength()
  userNum = (userNum.length).toString().padStart(4, "0");
  res.render("register", {
    userNum: userNum,
    sponsor: null,
    thailand: thailand,
  });
});

router.get("/register/:sponsor", async (req, res) => {
  const sponsor = await sql.getUser(req.params.sponsor);
  const thailand = await sql.queryPromise("SELECT * FROM thailands")
  var userNum = await sql.getLength()
  userNum = (userNum.length).toString().padStart(4, "0");
  res.render("register", {
    userNum: userNum,
    sponsor: sponsor,
    thailand: thailand,
  });
});

router.post("/register", async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      passport.authenticate("local-signup", async (err, user, info) => {
        if (err) {
          reject(err);
        } else if (!user) {
          // Handle authentication failure
          reject();
        } else {
          resolve(user);
        }
      })(req, res, next);
    });

    const sponsortemp = await sql.getUser(req.body.sponsor);
    const addressId = "ADD-" + req.body.username;
    const bankId = "BBK-" + req.body.username;
    const walletId = "WAL-" + req.body.username;
    const latestUserQuery = "SELECT * FROM users ORDER BY username DESC LIMIT 1";
    const latestUserResult = await sql.queryPromise(latestUserQuery);
    const counttemp = latestUserResult[0].count + 1;

    const newUserQuery = `INSERT INTO users 
                                      (username, fullName, addressId, citizen, phoneNumber, bankId, count, sponsor, walletId) 
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const newUserValues = [
      req.body.username,
      req.body.firstName,
      req.body.lastName,
      addressId,
      req.body.citizen,
      req.body.phoneNumber,
      bankId,
      counttemp,
      sponsortemp,
      walletId,
    ];
    await sql.queryPromise(newUserQuery, newUserValues);

    await sql.getChild(String(req.body.username))

    const newAddressQuery = `INSERT INTO addresses (address, subdistrict, district, city, postCode, addressId) 
                              VALUES (?, ?, ?, ?, ?, ?)`;
    const newAddressValues = [
      req.body.address,
      req.body.subdistrict,
      req.body.district,
      req.body.city,
      req.body.postCode,
      addressId,
    ];
    await sql.queryPromise(newAddressQuery, newAddressValues);

    
    const newBankQuery = `INSERT INTO banks (bank, bookBank, bookBankNumber, bookBankBranch, bankId) 
                            VALUES (?, ?, ?, ?,?)`;
    const newBankValues = [
      req.body.bank,
      req.body.bookBank,
      req.body.bookBankNumber,
      req.body.bookBankBranch,
      bankId,
    ];
    await sql.queryPromise(newBankQuery, newBankValues);

    const startWalletQuery = `INSERT INTO wallets (money, point, total, walletId) VALUES (?, ?, ?, ?)`;
    const startWalletValues = [0, 0, 0, walletId];
    await sql.queryPromise(startWalletQuery, startWalletValues);

    res.redirect("/login");
  } catch (error) {
    res.redirect("/register");
  }
});



router.post("/login", async (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log(user);
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

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      // Handle any error that occurred during logout
      console.error(err);
      // Optionally, send an error response to the client
      res.status(500).send("Logout failed");
    } else {
      // Logout was successful
      // Optionally, send a success response to the client
      res.redirect("/");
    }
  });
});


module.exports = router;
