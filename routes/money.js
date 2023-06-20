const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


router.get("/", async (req, res) => {
    if (req.isAuthenticated()) {
      res.render("money", {
        wallet: req.user.userWallet,
        user: req.user,
      });
    } else {
      res.redirect("/login");
    }
  });
  
  router.get("/add", async (req, res) => {
    const wallet = req.user.userWallet;
    const updatedMoney = wallet.money + 100;
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "userWallet.money": updatedMoney } },
      { returnOriginal: false }
    );
    res.redirect("/money");
  });
  
  router.get("/transfer", async (req, res) => {
    const wallet = req.user.userWallet;
    const updatedMoney = wallet.money + 20;
    const updatedPoint = wallet.point - 100;
    if (wallet.point >= 100) {
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            "userWallet.money": updatedMoney,
            "userWallet.point": updatedPoint,
          },
        },
        { returnOriginal: false }
      );
      alert("Success!");
      res.redirect("/money");
    } else {
      alert("Not Enough!");
      res.redirect("/money");
    }
  });

module.exports = router;