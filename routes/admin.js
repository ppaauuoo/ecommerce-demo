const express = require("express");
const router = express.Router();



const date = require("../helper/date.js");

var con = require("../database");


const getData = async () => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users u LEFT JOIN addresses a ON u.address_id=a.address_id LEFT JOIN banks b ON u.bank_id=b.bank_id LEFT JOIN wallets w ON u.userWallet_id=w.userWallet_id WHERE u.isAdmin!=1",
      (err, rows) => {
        resolve(rows);
      }
    );
  });
};

const getId = async (id) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users u LEFT JOIN addresses a ON u.address_id=a.address_id LEFT JOIN banks b ON u.bank_id=b.bank_id LEFT JOIN wallets w ON u.userWallet_id=w.userWallet_id WHERE u._id='" +
        id +
        "'",
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

  res.render("admin", {
    user: req.user,
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
        "UPDATE users u LEFT JOIN addresses a ON u.address_id=a.address_id LEFT JOIN banks b ON u.bank_id=b.bank_id SET a.address='" +
          req.body.address +
          "', a.subdistrict='" +
          req.body.subdistrict +
          "', a.district='" +
          req.body.district +
          "', a.city='" +
          req.body.city +
          "', a.postCode='" +
          req.body.postCode +
          "', b.bank='" +
          req.body.bank +
          "', b.bookBank='" +
          req.body.bookBank +
          "', b.bookBankNumber=" +
          req.body.bookBankNumber +
          ", b.bookBankBranch='" +
          req.body.bookBankBranch +
          "', u.fullName='" +
          req.body.fullName +
          "', u.citizen='" +
          req.body.citizen +
          "', u.phoneNumber=" +
          req.body.phoneNumber +
          " WHERE u._id='" +
          req.body.id +
          "'",
        (err, rows) => {
          if(err){
            throw(err)
            
          }
            
          resolve(rows);
        }
      );
    });

    res.json({
      message: "ข้อมูลถูกแก้ไข",
    });
  }
});

module.exports = router;
