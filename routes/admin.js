const express = require("express");
const router = express.Router();

var con = require("../database");
const sql = require("../helper/sqlCommand.js");

const date = require("../helper/date.js");

const bcrypt = require('bcrypt')

const saltRounds = 10

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const day = date.getDate();
  const user = await sql.getUser(req.user.username)
  const usersAmount = await sql.getLength()
  const currentDayAmount = await sql.currentDayUser()


  res.render("page", 
  {
    user: user,
    page: '/admin/dashboard',
    pagerequire: {    
      usersAmount: usersAmount.length,
      currentDayAmount: currentDayAmount[0].amount_added,
      day: day,
    }
  })
});

router.get("/userdata", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const day = date.getDate();
  const user = await sql.getUser(req.user.username)
  res.render("page", 
  {
    user: user,
    page: '/admin/datatable',
    pagerequire: {
      day:day
    }
  })
});


router.post("/userdata", async (req, res) => {
  var action = req.body.action;
  if (action == "fetch") {
    const userData = await sql.getData(req.body.page);
    res.json(userData);
  }

  if (action == "fetch_single") {
    const user = await sql.getUserData(req.body.id);
    res.json(user);
  }

  if (action == "Edit") {
    await new Promise((resolve, reject) => {
      con.query(
        "UPDATE users u LEFT JOIN addresses a ON u.addressId=a.addressId LEFT JOIN banks b ON u.bankId=b.bankId SET a.address=?, a.subdistrict=?, a.district=?, a.city=?, a.postCode=?, b.bank=?, b.bookBank=?, b.bookBankNumber=?, b.bookBankBranch=?, u.firstName=?, u.lastName=?,u.citizen=?, u.phoneNumber=? WHERE u.username=?",
        [
          req.body.address,
          req.body.subdistrict,
          req.body.district,
          req.body.city,
          req.body.postCode,
          req.body.bank,
          req.body.bookBank,
          req.body.bookBankNumber,
          req.body.bookBankBranch,
          req.body.firstName,
          req.body.lastName,
          req.body.citizen,
          req.body.phoneNumber,
          req.body.username
        ],
        (err, rows) => {
          if (err) {
            throw err;
          }
          // Handle the query result
          resolve(rows)
        }
      );
    });
    res.json({
      message: "ข้อมูลของผู้ใช้หมายเลข "+req.body.username+" ถูกแก้ไข",
    });
  }

  if (action == "Password") {
    bcrypt.hash(req.body.password, saltRounds)
    .then(hash => {
      sql.queryPromise("UPDATE auth SET hash = ? WHERE username=?",[hash,req.body.username])
    })
    res.json({
      message: "รหัสผ่านของผู้ใช้หมายเลข "+req.body.username+" ถูกแก้ไข",
    });
  }
});

router.get("/tree", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const day = date.getDate();
  const user = await sql.getUser(req.user.username)
  const allTree = await sql.getAllUsers(0)


  res.render("page", 
  {
    user: user,
    page: '/admin/tree',
    pagerequire: {    
      day: day,
      allTree: allTree,
    }
  })
});

router.get("/ordersdata", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const day = date.getDate();
  const user = await sql.getUser(req.user.username)


  res.render("page", 
  {
    user: user,
    page: '/admin/ordertable',
    pagerequire: {    
      day: day,
    }
  })
});


router.post("/ordersdata", async (req, res) => {
  var action = req.body.action;
  if (action == "fetch") {
    const orders = await sql.getOrderData(req.body.page)
    res.json(orders);
  }

  if (action == "fetch_single") {
    const receipt = await queryPromise("SELECT * FROM orders WHERE orderId=?",[req.body.orderId])
    res.json(receipt[0]);
  }

  if (action == "Confirm") {
    await queryPromise(
        "UPDATE orders SET status=? WHERE orderId=?",
        [
          'การชำระเงินถูกยืนยัน',
          req.body.orderId
        ],
      )
    res.json({
      message: "ออเดอร์หมายเลข "+req.body.orderId+" ถูกยืนยัน",
    });
  }
});

module.exports = router;
