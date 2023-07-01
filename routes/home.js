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
    setTimeout(() => {
      res.render("home", {
        goods: goods,
        user: null,
      });},100);
    return;
  }
  const user = await sql.getUser(req.user.username)
  if(user.isAdmin){
    res.redirect('/admin')
  }
  const wallet = await sql.getWallet(user.walletId)

  res.render("home", {
    goods: goods,
    user: user,
    wallet: wallet
  })
});

router.post("/", async (req, res) => {
  res.redirect("/");
});

module.exports = router;
