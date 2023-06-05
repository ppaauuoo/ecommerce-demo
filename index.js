const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const alert = require("alert");
const calculate = require(__dirname + "/calculate.js");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(
    "mongodb+srv://vorkna:OpOr2546@cluster0.vvkoeom.mongodb.net/shopDB"
  );
}

//money placeholder
const WalletSchema = new mongoose.Schema({
  money: Number,
  point: Number,
  total: Number,
});
const Wallet = mongoose.model("Wallet", WalletSchema);
const startWallet = new Wallet({
  money: 0,
  point: 0,
  total: 0,
});
const CartSchema = new mongoose.Schema({
  goodsName: String,
  goodsPrice: Number,
  goodsDesc: String,
  goodsQuantity: Number,
  goodsSubTotal: Number,
});
//initialize user
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  userWallet: WalletSchema,
  userCart: [CartSchema],
});
UserSchema.plugin(passportLocalMongoose);
//initiialize user model
const User = mongoose.model("User", UserSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//goods
const GoodsSchema = new mongoose.Schema({
  goodsName: String,
  goodsDesc: String,
  goodsImage: String,
  goodsPrice: Number,
  goodsReview: Number
});
const Goods = mongoose.model("Goods", GoodsSchema);

let isLogin = false;

app.get("/", async (req, res) => {
  const product = await Goods.find({});
  if (isLogin) {
    
    const updatedTotal = await calculate.totalCalculate(req.user.userCart);
    const updating = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "userWallet.total": updatedTotal} },
      { returnOriginal: false,
        returnNewDocument: true }
    )
    const wallet = updating.userWallet
    res.render("home", {
      goods: product,
      wallet: wallet,
      isLogin: isLogin,
    });
  } else {
    

    res.render("home", {
      goods: product,
      isLogin: isLogin,
    });
  }
});

app.post("/", async (req, res) => {
  if (isLogin == false) {
    res.render("login");
    return;
  }

  const requestGoods = req.body.selectedItem;

  const cart = req.user.userCart;

  const product = await Goods.find({ goodsName: requestGoods });

  const dupe = calculate.searchCart(cart, requestGoods);


  if (dupe >= 0) {
    console.log('dupe! '+dupe)
    const newQuantity = cart[dupe].goodsQuantity + 1;
    const newSubTotal = cart[dupe].goodsPrice * newQuantity;

    await User.findOneAndUpdate(
      { _id: req.user._id, "userCart.goodsName": requestGoods},
      {
        $set: {
          "userCart.$.goodsQuantity": newQuantity,
          "userCart.$.goodsSubTotal": newSubTotal
        },
      },
      { returnOriginal: false }
    );
  } else {
    console.log('no dupe! '+dupe)
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) { 
      alert('Try Again!')
      return next(err); }
    return res.redirect('/secrets');
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
    isLogin = true;
  } else {
    res.redirect("/login");
  }
});

app.post("/register", async (req, res) => {
  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    userWallet: startWallet,
  });
  const password = req.body.password;
  User.register(newUser, password, function (err, user) {
    //A new user was saved
    passport.authenticate("local")(req, res, function () {
      res.redirect("/secrets");
    });
  });
});

app.get("/logout", (req, res, next) => {
  isLogin = false;
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get("/money", async (req, res) => {
  if (isLogin == false) {
    res.redirect("/");
    return;
  }
  if (req.isAuthenticated()) {
    res.render("money", {
      wallet: req.user.userWallet,
      isLogin: isLogin,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/money/add", async (req, res) => {
  const wallet = req.user.userWallet;
  const updatedMoney = wallet.money + 100;
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { "userWallet.money": updatedMoney} },
    { returnOriginal: false }
  )
  console.log(wallet.money)
  console.log(updatedMoney)
  res.redirect("/money");
});

app.get("/money/transfer", async (req, res) => {
  const wallet = req.user.userWallet;
  const updatedMoney = wallet.money + 20;
  const updatedPoint = wallet.point - 100;
  if (wallet.point >= 100) {
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "userWallet.money": updatedMoney, "userWallet.point": updatedPoint} },
      { returnOriginal: false }
    )
    alert("Success!");
    res.redirect("/money");
  } else {
    alert("Not Enough!");
    res.redirect("/money");
  }
});

app.get("/cart", async (req, res) => {
  if (isLogin == false) {
    res.redirect("/");
    return;
  }
  if (req.isAuthenticated()) {
    const updatedTotal = await calculate.totalCalculate(req.user.userCart);
    const updating = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "userWallet.total": updatedTotal} },
      { returnOriginal: false,
        returnNewDocument: true }
    )
    const wallet = updating.userWallet
    const cart = updating.userCart


    res.render("cart", {
      cart: cart,
      wallet: wallet,
      isLogin: isLogin,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/cart", function (req, res) {
  res.redirect("/cart");
});

app.get("/cart/checkout", async (req, res) => {
  const wallet = req.user.userWallet

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


    await User.findOneAndUpdate({_id: req.user._id}, { $set: { userCart: []}},{ returnOriginal: false });
    alert("you got " + pointObtained + " point!");
    res.redirect("/");
  }
});

app.post("/cart/delete", async (req, res) => {
  const request2DeleteGoods = req.body.selected2DeleteItem;
  await User.findOneAndUpdate({_id: req.user._id}, { $pull: { userCart: {goodsName: request2DeleteGoods }}},{ returnOriginal: false });
  res.redirect("/cart");
});

app.listen(process.env.PORT || 8000, function () {
  console.log("server start and running!");
});
