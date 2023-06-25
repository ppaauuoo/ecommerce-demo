const express = require("express");
const router = express.Router();

const sql = require("../helper/sqlCommand.js");

const calculate = require("../helper/calculate.js");
const date = require("../helper/date.js")

router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return
    }
    if(req.user.isAdmin){
      res.redirect("/admin")
      return
    }
    const currentUser = await sql.getUser(req.user.username)
    const wallet = await sql.getWallet(currentUser.walletId)
    const sqlTree = await sql.getTree(currentUser.username)
    const day = date.getDate();
    const sponsored = await sql.getSponsored(currentUser.username)
    const sponsorIncome = calculate.sponsorIncome(sponsored)
    const childIncome = calculate.childIncome(currentUser.childrenR)
    const emptySlot = calculate.emptySlot(sqlTree)
    const sponsorChild = await sql.sponsorChild(currentUser.username)
    res.render('account',{
      userName: currentUser,
      Child: sqlTree,
      user: currentUser,
      day: day,
      wallet: wallet,
      sponsored: sponsored,
      sponsorIncome: sponsorIncome,
      childIncome: childIncome,
      emptySlot:emptySlot,
      sponsorChild: sponsorChild.length
    })
  });
  
  
  
  router.get("/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }

    const currentUser = await sql.getUser(req.params.userId)
    if (!currentUser) {
      res.redirect("/");
      return;
    }

    const wallet = await sql.getWallet(currentUser.walletId)

    const sqlTree = await sql.getTree(req.params.userId)

    const day = date.getDate();
  
    res.render("user", {
      userName: currentUser,
      Child: sqlTree,
      user: currentUser,
      day: day,
      wallet: wallet,
    });
  });
  
  router.get("/:userId/sponsor", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }
    const currentUser = await sql.getUser(req.params.userId)
    const wallet = await sql.getWallet(currentUser.walletId)
    const sponsored = await sql.getSponsored(req.params.userId)
    const day = date.getDate();
    res.render("sponsor", {
      userName: currentUser,
      children: sponsored,
      user: currentUser,
      day: day,
      wallet: wallet
    });
  });



module.exports = router;

