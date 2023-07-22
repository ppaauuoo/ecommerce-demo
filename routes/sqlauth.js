const express = require("express");
const router = express.Router();

const passport = require("passport");
const passportConfig = require("../passport.js");

passportConfig(passport);

const sql = require("../helper/sqlCommand.js");



router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) {
      // Handle authentication error
      return next(err);
    }
    if (!user) {
      // Handle authentication failure
      return res.redirect("/login?authFailure=true");
    }
    req.logIn(user, (err) => {
      if (err) {
        // Handle login error
        return next(err);
      }
      // Authentication and login successful
      return res.redirect("/");
    });
  })(req, res, next);
});



router.get("/register", async (req, res) => {
  const thailand = await sql.queryPromise("SELECT DISTINCT ProvinceThai FROM thailands")
  var userNum = await sql.getLength()
  userNum = (userNum.length).toString().padStart(4, "0");
  res.render("register", {
    userNum: userNum,
    sponsor: null,
    thailand: thailand,
  });
});

router.post("/address", async (req, res) => {
  const thailand = await sql.queryPromise("SELECT DistrictThaiShort,PostCodeMain,TambonThaiShort FROM thailands WHERE ProvinceThai=?",[req.body.province])
  res.send(thailand)
});

router.get("/register/:sponsor", async (req, res) => {
  const id = req.params.sponsor
  const sponsor = await sql.getUser(id.slice(13));
  if(!sponsor){return res.redirect('/register')}
  const thailand = await sql.queryPromise("SELECT * FROM thailands")
  var userNum = await sql.getLength()
  userNum = (userNum.length).toString().padStart(4, "0");
  res.render("register", {
    userNum: userNum,
    sponsor: id,
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
          reject();
        } else {
          resolve();
        }
      })(req, res, next);
    });
    const sponsortemp = null
    const sponsor = req.body.sponsor
    if(sponsor){    
      sponsortemp = await sql.getUser(sponsor.slice(13));
      sponsortemp = sponsortemp.username
    }

    const addressId = "ADD-" + req.body.username;
    const bankId = "BBK-" + req.body.username;
    const walletId = "WAL-" + req.body.username;
    const latestUserQuery = "SELECT * FROM users ORDER BY username DESC LIMIT 1";
    const latestUserResult = await sql.queryPromise(latestUserQuery);
    const counttemp = latestUserResult[0].count + 1;

    const newUserQuery = `INSERT INTO users 
                                      (username, firstName, lastName, addressId, citizen, phoneNumber, bankId, count, sponsor, walletId) 
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
    res.redirect("/register?authFailure=true");
  }
});





router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      // Handle any error that occurred during logout
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
