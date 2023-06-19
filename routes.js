const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const alert = require("alert");
const calculate = require(__dirname + "/calculate.js");
const _ = require("lodash");

const $ = require('jquery')
const date = require(__dirname+"/date.js")

router.use(
  session({
    secret: "paulsocoolmakmak",
    resave: false,
    saveUninitialized: false,
  })
);
router.use(passport.initialize());
router.use(passport.session());

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

const CartSchema = new mongoose.Schema({
  goodsName: String,
  goodsPrice: Number,
  goodsDesc: String,
  goodsQuantity: Number,
  goodsSubTotal: Number,
});

const AddressSchema = new mongoose.Schema({
  address: String,
  subdistrict: String,
  district: String,
  city: String,
  postCode: Number,
});

const BankSchema = new mongoose.Schema({
  bank: String,
  bookBank: String,
  bookBankNumber: Number,
  bookBankBranch: String,
});
//initialize user
const UserSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  address: AddressSchema,
  citizen: Number,
  phoneNumber: Number,
  bank: BankSchema,
  password: String,
  children: [],
  parent: ObjectId,
  branch: Number,
  sponsor: String,
  userWallet: WalletSchema,
  userCart: [CartSchema],
  isAdmin: Boolean
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
  goodsReview: Number,
});
const Goods = mongoose.model("Goods", GoodsSchema);

let isLogin = false;

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
  if (req.isAuthenticated()) {
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
  } else {
    res.redirect("/login");
  }
});

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

const ThailandSchema = new mongoose.Schema({
  TambonThaiShort: String,
  DistrictThaiShort: String,
  ProvinceThai: String,
  PostCodeMain: Number,
});
const Thailand = mongoose.model("thailand", ThailandSchema);
const Bank = mongoose.model("bank", ThailandSchema);

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

  const Address = mongoose.model("Address", AddressSchema);
  const newAddress = new Address({
    address: req.body.address,
    subdistrict: req.body.subdistrict,
    district: req.body.district,
    city: req.body.city,
    postCode: req.body.postCode,
  });
  const Bank = mongoose.model("Bank", BankSchema);
  const newBank = new Bank({
    bank: req.body.bank,
    bookBank: req.body.bookBank,
    bookBankNumber: req.body.bookBankNumber,
    bookBankBranch: req.body.bookBankBranch,
  });
  const Wallet = mongoose.model("Wallet", WalletSchema);
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

router.get("/money", async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("money", {
      wallet: req.user.userWallet,
      user: req.user,
    });
  } else {
    res.redirect("/login");
  }
});

router.get("/money/add", async (req, res) => {
  const wallet = req.user.userWallet;
  const updatedMoney = wallet.money + 100;
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { "userWallet.money": updatedMoney } },
    { returnOriginal: false }
  );
  console.log(wallet.money);
  console.log(updatedMoney);
  res.redirect("/money");
});

router.get("/money/transfer", async (req, res) => {
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

router.get("/cart", async (req, res) => {
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

router.post("/cart", function (req, res) {
  res.redirect("/cart");
});

router.get("/cart/checkout", async (req, res) => {
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

router.post("/cart/delete", async (req, res) => {
  const request2DeleteGoods = req.body.selected2DeleteItem;
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { userCart: { goodsName: request2DeleteGoods } } },
    { returnOriginal: false }
  );
  res.redirect("/cart");
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


router.get("/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return
  }
  if(req.user.isAdmin){
    res.redirect("/admin")
    return
  }
  res.redirect("/user/" + req.user._id);
});

router.get("/admin", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const day = date.getDate()
  const userData = await User.find({isAdmin: { $ne: 1 }})
  res.render("admin", {
    user: req.user,
    day: day,
    userData: userData
  });
});

router.get("/user/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  var id;
  try {
    id = new ObjectId(req.params.userId);
  } catch (err) {
    res.redirect("/");
    return;
  }
  const currentUser = await User.findById(
    { _id: id },
    { username: 1, children: 1 }
  ).exec();
  if (!currentUser) {
    res.redirect("/");
    return;
  }

  var Tree = await User.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $graphLookup: {
        from: "users",
        startWith: "$children._id",
        connectFromField: "children._id",
        connectToField: "_id",
        as: "tree",
        maxDepth: 5,
        depthField: "child",
      },
    },
    {
      $unset: [
        "fullName",
        "address",
        "citizen",
        "phoneNumber",
        "bank",
        "children",
        "sponsor",
        "userWallet",
        "userCart",
        "salt",
        "hash",
        "tree.fullName",
        "tree.address",
        "tree.citizen",
        "tree.phoneNumber",
        "tree.bank",
        "tree.children",
        "tree.sponsor",
        "tree.userWallet",
        "tree.userCart",
        "tree.salt",
        "tree.hash",
      ],
    },
    {
      $unwind: {
        path: "$tree",
      },
    },
    {
      $sort: {
        "tree.count": 1,
      },
    },
  ]);


  const day = date.getDate();

  res.render("user", {
    userName: currentUser,
    Child: Tree,
    user: req.user,
    day: day,
    wallet: req.user.userWallet || null,
  });
});

router.get("/user/:userId/sponsor", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const id = new ObjectId(req.params.userId);
  const currentUser = await User.findById({ _id: id });
  const children = await User.find({ sponsor: req.params.userId });
  const day = date.getDate();
  res.render("sponsor", {
    userName: currentUser,
    children: children,
    user: req.user,
    day: day,
    wallet: req.user.userWallet || null,
  });
});

router.get("/test", async (req, res) => {
  res.redirect('/')
});

module.exports = router;
