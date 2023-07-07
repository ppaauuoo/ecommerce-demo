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

const updateWallet = async (UserCart, wallet) => {
  var updatedTotal = 0;
  UserCart.forEach((e) => {
    updatedTotal += e.goodsPrice * e.quantity;
  });
  await sql.queryPromise("UPDATE wallets SET total = ? WHERE walletId = ?", [
    updatedTotal,
    wallet.walletId,
  ]);
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

  await updateWallet(UserCart, wallet);

  res.render("cart", {
    cart: UserCart,
    wallet: wallet,
    user: user,
  });
});

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }

  const user = await sql.getUser(req.user.username);
  const wallet = await sql.getWallet(user.walletId);
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

  await updateWallet(UserCart, wallet)
  res.redirect("/");
});


router.get("/checkout", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  const user = await sql.getUser(req.user.username);
  const wallet = await sql.getWallet(user.walletId);

  if (wallet.money < wallet.total) {
    res.redirect("/cart");
  } else {
    const pointObtained = calculate.pointCalculate(wallet.total);
    const updatedMoney = wallet.money - wallet.total;
    const updatedPoint = wallet.point + pointObtained;

    await sql.queryPromise(
      "UPDATE wallets SET money = ?,point = ? WHERE walletId = ?",
      [updatedMoney, updatedPoint, wallet.walletId]
    );



    await sql.queryPromise("UPDATE wallets SET total = ? WHERE walletId = ?", [
      0,
      wallet.walletId,
    ]);


    const UserCart = await getCart(user);
    const id = calculate.idGenerator()
    await sql.queryPromise("INSERT INTO orders (orderId, username) VALUES (?,?)", [
      id,user.username
    ]);
    UserCart.forEach(async (e)=>{
      await sql.queryPromise("INSERT INTO orderitems (orderId, goodId, quantity) VALUES (?,?,?)", [
        id, e.goodId, e.quantity
      ]);
      // total+=e.goodsPrice*e.quantity
      // totalQuantity+=e.quantity
    })


    await sql.queryPromise("DELETE FROM cart WHERE username = ?", [
      user.username,
    ]);

    res.redirect("/order/"+id);
  }
});

router.post("/delete", async (req, res) => {
  const selectedItem = await getItem(req.body.selectedItem);

  await sql.queryPromise("DELETE FROM cart WHERE goodId = ? AND username=?", [
    selectedItem[0].goodId,req.user.username
  ]);

  res.redirect("/cart");
});

module.exports = router;
