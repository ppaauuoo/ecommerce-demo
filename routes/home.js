const express = require("express");
const router = express.Router();

const con = require("../database");
const sql = require("../helper/sqlCommand.js");

router.get("/", async (req, res) => {
  const goods = await new Promise((resolve, reject) => {
    con.query("SELECT * FROM goods ", (err, rows) => {
      resolve(rows);
    });
  });

  if (!req.isAuthenticated()) {
    return res.render("page", {
      page: 'home',
      user: null,
      pagerequire: {goods: goods},
    })
  }

  const user = await sql.getUser(req.user.username)
  if(user.isAdmin){
    res.redirect('/admin')
  }
  const wallet = await sql.getWallet(user.walletId)
  res.render("page", 
  {
    user: user,
    wallet: wallet,
    total: req.cookies.total,
    page: 'home',
    pagerequire: {    
      goods: goods,
    }
  })
});

router.post("/", async (req, res) => {
  res.redirect("/");
});

module.exports = router;
