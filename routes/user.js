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
      "SELECT node.username, node._id"+
      "FROM users AS node,"+
              "users AS parent"+
      "WHERE node.childrenL BETWEEN parent.childrenL AND parent.childrenR"+
              "AND parent._id = '"+id+"'"+
      "ORDER BY node.childrenL;"
      ,(err, rows) => {
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


    var id = new ObjectId(req.params.userId);
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

