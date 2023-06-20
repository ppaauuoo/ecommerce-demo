const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const calculate = require("../helper/calculate.js")


const User = mongoose.model("User");

router.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    const updatedTotal = await calculate.totalCalculate(req.user.userCart);
    const updating = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "userWallet.total": updatedTotal } },
      { returnOriginal: false, returnNewDocument: true }
    );
    const wallet = updating.userWallet;
    const cart = updating.userCart;

    res.render("cart", {
      cart: cart,
      wallet: wallet,
      user: req.user,
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/", function (req, res) {
  res.redirect("/cart");
});

router.get("/checkout", async (req, res) => {
  const wallet = req.user.userWallet;

  if (wallet.money < wallet.total) {
    alert("Not Enough!");
    res.redirect("/cart");
  } else {
    const pointObtained = calculate.pointCalculate(wallet.total);
    const updatedMoney = wallet.money - wallet.total;
    const updatedPoint = wallet.point + pointObtained;

    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        userWallet: {
          money: updatedMoney,
          point: updatedPoint,
          total: wallet.total,
        },
      },
      { returnOriginal: false }
    );

    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { userCart: [] } },
      { returnOriginal: false }
    );
    alert("you got " + pointObtained + " point!");
    res.redirect("/");
  }
});

router.post("/delete", async (req, res) => {
  const request2DeleteGoods = req.body.selected2DeleteItem;
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { userCart: { goodsName: request2DeleteGoods } } },
    { returnOriginal: false }
  );
  res.redirect("/cart");
});

module.exports = router;