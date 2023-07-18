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
    const currentUser = await sql.getUser(req.user.username)
    if(currentUser.isAdmin){
      res.redirect("/admin/tree")
      return
    }    const wallet = await sql.getWallet(currentUser.walletId)
    const sqlTree = await sql.getTree(currentUser.username)
    const day = date.getDate();
    const sponsored = await sql.getSponsored(currentUser.username)
    const sponsorIncome = calculate.sponsorIncome(sponsored)
    const childIncome = calculate.childIncome(sqlTree)
    const emptySlot = calculate.emptySlot(sqlTree)
    const sponsorChild = await sql.sponsorChild(currentUser.username)

    res.render("page", 
    {
      user: currentUser,
      wallet: wallet||null,
      total: req.cookies.total,
      page: '/user/account',
      pagerequire: {    
        userName: currentUser,
        Child: sqlTree,
        day: day,
        sponsored: sponsored,
        sponsorIncome: sponsorIncome,
        childIncome: childIncome,
        emptySlot:emptySlot,
        sponsorChild: sponsorChild.length
      }
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
  
    res.render("page", 
    {
      user: currentUser,
      wallet: wallet||null,
      total: req.cookies.total,
      page: '/user/user',
      pagerequire: {    
        userName: currentUser,
        Child: sqlTree,
        day: day,
      }
    })
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

    res.render("page", 
    {
      user: currentUser,
      wallet: wallet||null,
      total: req.cookies.total,
      page: '/user/sponsor',
      pagerequire: {    
        userName: currentUser,
        children: sponsored,
        day: day,
      }
    })
  });



module.exports = router;

