const express = require("express");
const router = express.Router();



const date = require("../helper/date.js");

var con = require("../database");


const getData = async () => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users u LEFT JOIN addresses a ON u.addressId=a.addressId LEFT JOIN banks b ON u.bankId=b.bankId LEFT JOIN wallets w ON u.walletId=w.walletId WHERE u.isAdmin!=1",
      (err, rows) => {
        resolve(rows);
      }
    );
  });
};

const getId = async (username) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users u LEFT JOIN addresses a ON u.addressId=a.addressId LEFT JOIN banks b ON u.bankId=b.bankId LEFT JOIN wallets w ON u.walletId=w.walletId WHERE u.username=?",
       [username],
      (err, rows) => {
        resolve(rows[0]);
      }
    );
  });
};

const getUser = async (username) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users WHERE username=?",[username],
      (err, rows) => {
        resolve(rows[0]);
      }
    );
  });
};

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const day = date.getDate();
  const userData = await getData();
  const user = await getUser(req.user.username)
  res.render("admin", {
    user: user,
    day: day,
    userData: userData,
  });
});

router.post("/", async (req, res) => {
  var action = req.body.action;
  if (action == "fetch") {
    const userData = await getData();
    res.json(userData);
  }

  if (action == "fetch_single") {
    const user = await getId(req.body.id);
    res.json(user);
  }

  if (action == "Edit") {
    await new Promise((resolve, reject) => {
      con.query(
        "UPDATE users u LEFT JOIN addresses a ON u.addressId=a.addressId LEFT JOIN banks b ON u.bankId=b.bankId SET a.address=?, a.subdistrict=?, a.district=?, a.city=?, a.postCode=?, b.bank=?, b.bookBank=?, b.bookBankNumber=?, b.bookBankBranch=?, u.fullName=?, u.citizen=?, u.phoneNumber=? WHERE u.username=?",
        [
          req.body.address,
          req.body.subdistrict,
          req.body.district,
          req.body.city,
          req.body.postCode,
          req.body.bank,
          req.body.bookBank,
          req.body.bookBankNumber,
          req.body.bookBankBranch,
          req.body.fullName,
          req.body.citizen,
          req.body.phoneNumber,
          req.body.username
        ],
        (err, rows) => {
          if (err) {
            throw err;
          }
          // Handle the query result
          resolve(rows)
        }
      );
    });
    console.log('fin')
    res.json({
      message: "ข้อมูลถูกแก้ไข",
    });
  }
});

module.exports = router;
