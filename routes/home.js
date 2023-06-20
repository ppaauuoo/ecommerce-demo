const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const calculate = require("../helper/calculate.js")

const User = mongoose.model("User");
const Goods = mongoose.model("Goods");

router.get("/", async (req, res) => {
    const product = await Goods.find({});
    if (!req.isAuthenticated()) {
      res.render("home", {
        goods: product,
        user: null
      });
      return
    }
    const updatedTotal = await calculate.totalCalculate(req.user.userCart);
    const updating = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "userWallet.total": updatedTotal } },
      { returnOriginal: false, returnNewDocument: true }
    );
    const wallet = updating.userWallet;
    res.render("home", {
      goods: product,
      wallet: wallet,
      user: req.user
    });
  });
  
  router.post("/", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return
    }
    const requestGoods = req.body.selectedItem;
  
    const cart = req.user.userCart;
  
    const product = await Goods.find({ goodsName: requestGoods });
  
    const dupe = calculate.searchCart(cart, requestGoods);
  
    if (dupe >= 0) {
      const newQuantity = cart[dupe].goodsQuantity + 1;
      const newSubTotal = cart[dupe].goodsPrice * newQuantity;
      await User.findOneAndUpdate(
        { _id: req.user._id, "userCart.goodsName": requestGoods },
        {
          $set: {
            "userCart.$.goodsQuantity": newQuantity,
            "userCart.$.goodsSubTotal": newSubTotal,
          },
        },
        { returnOriginal: false }
      );
    } else {
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: {
            userCart: {
              goodsName: product[0].goodsName,
              goodsPrice: product[0].goodsPrice,
              goodsDesc: product[0].goodsDesc,
              goodsQuantity: 1,
              goodsSubTotal: product[0].goodsPrice,
            },
          },
        },
        { returnOriginal: false }
      );
    }
    res.redirect("/");
  });

  module.exports = router;