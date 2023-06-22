const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const date = require("../helper/date.js");

var con = require("../database");

const User = mongoose.model("User");
const Address = mongoose.model("Address");
const Bank = mongoose.model("Bank");
const Wallet = mongoose.model("Wallet");

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
  //const userData = await User.find({isAdmin: { $ne: 1 }})
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
    // const newAddress = new Address({
    //   address: req.body.address,
    //   subdistrict: req.body.subdistrict,
    //   district: req.body.district,
    //   city: req.body.city,
    //   postCode: req.body.postCode,
    // });

    // const newBank = new Bank({
    //   bank: req.body.bank,
    //   bookBank: req.body.bookBank,
    //   bookBankNumber: req.body.bookBankNumber,
    //   bookBankBranch: req.body.bookBankBranch,
    // });

    // const newWallet = new Wallet({
    //   money: req.body.money,
    //   point: req.body.point,
    //   total: req.body.total,
    // });

    // await User.findOneAndUpdate({_id: req.body.id},
    //   {
    //     username: req.body.username,
    //     fullName: req.body.fullName,
    //     address: newAddress,
    //     citizen: req.body.citizen,
    //     phoneNumber: req.body.phoneNumber,
    //     bank: newBank,
    //     //sponsor: req.body.sponsor,
    //     //userWallet: newWallet,
    //   },{
    //     returnOriginal: false
    //   });
    console.log(req.body)
    await new Promise((resolve, reject) => {
      con.query(
        "UPDATE users u LEFT JOIN addresses a ON u.address_id=a.address_id LEFT JOIN banks b ON u.bank_id=b.bank_id LEFT JOIN wallets w ON u.userWallet_id=w.userWallet_id SET a.address='" +
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
          "', u.username='" +
          req.body.username +
          "', u.fullName='" +
          req.body.fullName +
          "', u.citizen='" +
          req.body.citizen +
          "', u.phoneNumber=" +
          req.body.phoneNumber +
          ", w.money=" +
          req.body.money +
          ", w.point=" +
          req.body.point +
          " WHERE u._id='" +
          req.body.id +
          "'",
        (err, rows) => {
          resolve(rows);
          console.log(rows)
        }
      );
    });

    res.json({
      message: "ข้อมูลถูกแก้ไข",
    });
  }
});

module.exports = router;
