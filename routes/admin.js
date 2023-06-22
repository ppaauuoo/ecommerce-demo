const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const date = require("../helper/date.js")

var con = require("../database");

const User = mongoose.model("User");
const Address = mongoose.model("Address");
const Bank = mongoose.model("Bank");
const Wallet = mongoose.model("Wallet");


router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }
    const day = date.getDate()
    //const userData = await User.find({isAdmin: { $ne: 1 }})
    const userData = await new Promise((resolve, reject) => {
      con.query("SELECT * FROM users u INNER JOIN addresses a ON u.address_id=a.address_id INNER JOIN banks b ON u.bank_id=b.bank_id WHERE u.isAdmin!=1", (err, rows) => {
        resolve(rows);
      });
    });

    console.log(userData)
    res.render("admin", {
      user: req.user,
      day: day,
      userData: userData
    });
  });

  router.post("/", async (req, res) => {
    var action = req.body.action;
    if(action == 'fetch'){
      const userData = await User.find({isAdmin: { $ne: 1 }})
      res.json(userData);
    }

    if(action == 'fetch_single')
    {  
      var id = new ObjectId(req.body.id);
      var user = await User.findById(id)
      res.json(user);
    }
  
    if(action == 'Edit')
    {
      const newAddress = new Address({
        address: req.body.address,
        subdistrict: req.body.subdistrict,
        district: req.body.district,
        city: req.body.city,
        postCode: req.body.postCode,
      });
     
      const newBank = new Bank({
        bank: req.body.bank,
        bookBank: req.body.bookBank,
        bookBankNumber: req.body.bookBankNumber,
        bookBankBranch: req.body.bookBankBranch,
      });

      // const newWallet = new Wallet({
      //   money: req.body.money,
      //   point: req.body.point,
      //   total: req.body.total,
      // });

      
      await User.findOneAndUpdate({_id: req.body.id},
        {
          username: req.body.username,
          fullName: req.body.fullName,
          address: newAddress,
          citizen: req.body.citizen,
          phoneNumber: req.body.phoneNumber,
          bank: newBank,
          //sponsor: req.body.sponsor,
          //userWallet: newWallet,
        },{
          returnOriginal: false
        });      
      res.json({
        message : 'ข้อมูลถูกแก้ไข'
      });
    }
  
  });


module.exports = router;

