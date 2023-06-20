const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

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

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/security");
      });
    }
  });
});

router.get("/security", (req, res) => {
  if (req.isAuthenticated()) {
    isLogin = true;
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
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

router.get("/register/:sponsorId", async (req, res) => {
  var id;
  try {
    id = new ObjectId(req.params.sponsorId);
  } catch (err) {
    res.redirect("/register");
    return;
  }
  const temp = await User.findById({ _id: id });
  if (!temp) {
    res.redirect("/register");
    return;
  }
  const thailand = await Thailand.find({});
  const userNum = (await User.count()).toString().padStart(4, "0");
  res.render("register", {
    userNum: userNum,
    sponsor: req.params.sponsorId,
    thailand: thailand,
  });
});

router.post("/register", async (req, res) => {
  var sponsortemp = req.body.sponsor;
  var id;
  var temp;
  try {
    id = new ObjectId(sponsortemp);
    temp = await User.findById({ _id: id });
  } catch (err) {
    sponsortemp = null;
  }
  if (!temp) {
    sponsortemp = null;
  }


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

  const startWallet = new Wallet({
    money: 0,
    point: 0,
    total: 0,
  });

  const latest = await User.find().limit(1).sort({ $natural: -1 });
  const counttemp = latest.count + 1;

  const newUser = new User({
    username: req.body.username,
    fullName: req.body.fullName,
    address: newAddress,
    citizen: req.body.citizen,
    phoneNumber: req.body.phoneNumber,
    bank: newBank,
    children: [],
    count: counttemp,
    sponsor: sponsortemp,
    userWallet: startWallet,
  });
  const password = req.body.password;
  User.register(newUser, password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/mlm");
      });
    }
    //A new user was saved
  });
});

router.get("/logout", (req, res, next) => {
  isLogin = false;
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});





router.get("/mlm", async (req, res) => {
  if (req.isAuthenticated()) {
    const parent = await User.findOneAndUpdate(
      { $expr: { $lt: [{ $size: "$children" }, 2] } },
      {
        $push: {
          children: {
            _id: req.user._id,
            username: req.user.username,
          },
        },
      },
      { returnOriginal: false }
    );

    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          parent: parent._id,
          branch: parent.children.count,
        },
      },
      { returnOriginal: false, upsert: true }
    );

    isLogin = true;
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

module.exports = router;