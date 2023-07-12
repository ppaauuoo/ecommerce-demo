const express = require("express");
const router = express.Router();

const passport = require("passport");
const session = require("express-session");

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const flash = require('express-flash');

const mongodb = require('./mongodb.js')

router.use(flash());
router.use(express.static("public"));
router.use(express.json());

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(
  session({
    secret: "paulsocoolmakmak",
    resave: false,
    saveUninitialized: false,
  })
);
router.use(passport.initialize());
router.use(passport.session());




admin = require('./routes/admin.js')
router.use('/admin', admin);

user = require('./routes/user.js')
router.use('/user', user);

cart = require('./routes/cart.js')
router.use('/cart', cart);

money = require('./routes/money.js')
router.use('/money', money);

order = require('./routes/order.js')
router.use('/order', order);

auth = require('./routes/sqlauth.js')
router.use('/', auth);

home = require('./routes/home.js')
router.use('/', home);



module.exports = router;
