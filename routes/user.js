const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const date = require("../helper/date.js")
const ObjectId = require("mongodb").ObjectId;

const User = mongoose.model("User");

var con = require("../database");

const getId = async (id) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users WHERE _id='" +
        id +
        "'",
      (err, rows) => {
        resolve(rows[0]);
      }
    );
  });
};

const getTree = async (id) =>{
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT t1.username AS lev1, t1._id AS lev1id, t2.username AS lev2, t2._id AS lev2id, t3.username AS lev3, t3._id AS lev3id, t4.username AS lev4, t4._id AS lev4id, t5.username AS lev5, t5._id AS lev5id, t6.username AS lev6, t6._id AS lev6id FROM users t1 LEFT JOIN users t2 ON t2._id = t1.childrenL OR t2._id = t1.childrenR LEFT JOIN users t3 ON t3._id = t2.childrenL OR t3._id = t2.childrenR LEFT JOIN users t4 ON t4._id = t3.childrenL OR t4._id = t3.childrenR LEFT JOIN users t5 ON t5._id = t4.childrenL OR t5._id = t4.childrenR LEFT JOIN users t6 ON t6._id = t5.childrenL OR t6._id = t5.childrenR WHERE t1._id = '"+id+"'"
      ,(err, rows) => {
        if(err){
          console.log(err)
        }
          
        resolve(rows);
      }
    );
  });




}


router.get("/", async (req, res) => {
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
  
  
  
  router.get("/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }
    const currentUser = await getId(req.params.userId)
    if (!currentUser) {
      res.redirect("/");
      return;
    }

    const sqlTree = await getTree(req.params.userId)
    console.log(sqlTree)


 
  
  
    const day = date.getDate();
  
    res.render("user", {
      userName: currentUser,
      Child: sqlTree,
      user: req.user,
      day: day,
      wallet: req.user.userWallet || null,
    });
  });
  
  router.get("/:userId/sponsor", async (req, res) => {
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


module.exports = router;

