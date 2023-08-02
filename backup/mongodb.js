const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(
    "mongodb+srv://vorkna:OpOr2546@cluster0.vvkoeom.mongodb.net/shopDB"
  );
}

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
  isAdmin: Number
});
// UserSchema.plugin(passportLocalMongoose);

//initiialize user model
const User = mongoose.model("User", UserSchema);
// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

//goods
const GoodsSchema = new mongoose.Schema({
  goodsName: String,
  goodsDesc: String,
  goodsImage: String,
  goodsPrice: Number,
  goodsReview: Number,
});

const Goods = mongoose.model("Goods", GoodsSchema);
const Address = mongoose.model("Address", AddressSchema);
const Bank = mongoose.model("Bank", BankSchema);
const Wallet = mongoose.model("Wallet", WalletSchema);