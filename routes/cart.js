const express = require("express");
const router = express.Router();



const calculate = require("../helper/calculate.js");
const sql = require("../helper/sqlCommand.js");






const getCart = async (user) => {
  return await sql.queryPromise(
    "SELECT * FROM cart c INNER JOIN goods g ON c.goodId = g.goodId WHERE username = ?",
    [user.username]
  );
};

const getItem = async (item) => {
  return await sql.queryPromise("SELECT * FROM goods WHERE goodsName = ?", [
    item,
  ]);
};

const updateWallet =  (UserCart, res) => {
  var updatedTotal = 0;
  UserCart.forEach((e) => {
    updatedTotal += e.goodsPrice * e.quantity;
  });
  res.cookie('total', updatedTotal);
};

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const user = await sql.getUser(req.user.username);
  if(user.isAdmin){
    res.redirect('/admin')
  }
  const wallet = await sql.getWallet(user.walletId);
  const UserCart = await getCart(user);

  updateWallet(UserCart, res);
  res.render("page", 
  {
    user: user,
    wallet: wallet||null,
    total: req.cookies.total,
    page: 'cart',
    pagerequire: {    
      cart: UserCart,
      total: req.cookies.total
    }
  })

});

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }

  const user = await sql.getUser(req.user.username);
  const selectedItem = await getItem(req.body.selectedItem);
  const UserCart = await getCart(user);

  var dupe = 0;
  UserCart.forEach(async (e) => {
    if (e.goodId == selectedItem[0].goodId) {
      dupe++;
    }
  });
  if (dupe) {
    await sql.queryPromise(
      "UPDATE cart SET quantity = quantity + 1 WHERE goodId = ?",
      [selectedItem[0].goodId]
    );
  } else {
    await sql.queryPromise("INSERT INTO cart (username, goodId) VALUES (?,?)", [
      user.username,
      selectedItem[0].goodId,
    ]);
  }

  updateWallet(UserCart, res)
  res.redirect("/");
});


router.get("/checkout", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const user = await sql.getUser(req.user.username);
  // const wallet = await sql.getWallet(user.walletId);

  // if (wallet.money < req.cookies.total) {
  //   res.redirect("/cart");
  //    return
  // }

  // const pointObtained = calculate.pointCalculate(req.cookies.total);
  //   const updatedMoney = wallet.money - req.cookies.total;
  //   const updatedPoint = wallet.point + pointObtained;

  //   await sql.queryPromise(
  //     "UPDATE wallets SET money = ?,point = ? WHERE walletId = ?",
  //     [updatedMoney, updatedPoint, wallet.walletId]
  //   );



    res.cookie('total', 0)


    const UserCart = await getCart(user);
    const id = calculate.idGenerator()
    await sql.queryPromise("INSERT INTO orders (orderId, username) VALUES (?,?)", [
      id,user.username
    ]);
    UserCart.forEach(async (e)=>{
      await sql.queryPromise("INSERT INTO orderitems (orderId, goodId, quantity) VALUES (?,?,?)", [
        id, e.goodId, e.quantity
      ]);
    })


    await sql.queryPromise("DELETE FROM cart WHERE username = ?", [
      user.username,
    ]);

    res.redirect("/order/"+id);
});

router.post("/delete", async (req, res) => {
  const selectedItem = await getItem(req.body.selectedItem);

  await sql.queryPromise("DELETE FROM cart WHERE goodId = ? AND username=?", [
    selectedItem[0].goodId,req.user.username
  ]);

  res.redirect("/cart");
});

module.exports = router;
