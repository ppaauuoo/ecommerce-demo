  const express = require("express");
  const router = express.Router();
  const mongoose = require("mongoose");
  // main().catch((err) => console.log(err));
  // async function main() {
  //   await mongoose.connect(
  //     "mongodb+srv://vorkna:OpOr2546@cluster0.vvkoeom.mongodb.net/shopDB"
  //   );
  // }


  const Test = mongoose.model("Goods");

  router.get("/test", async (req, res) => {
    res.render("test",{
      test: "dog"
    })
  });

  router.post("/test", async (req, res) => {
    if(action='fetch'){
      const test = await Test.find({})
      res.json({
        test: test
      })
    }

  });


  module.exports = router;

