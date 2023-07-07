const express = require("express");
const router = express.Router();

const _ = require('lodash')

const sql = require("../helper/sqlCommand.js");

const calculate = require("../helper/calculate.js");
const date = require("../helper/date.js")

router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  
  const user = await sql.getUser(req.user.username);
  const wallet = await sql.getWallet(user.walletId);
  
  const orders = await sql.getOrders(user.username);

  for (const order of orders) {
    const thing = await sql.getOrderItems(order.orderId);
    let totalQuantity = 0;
    let total = 0;
  
    for (const item of thing) {
      totalQuantity += item.quantity;
      total += item.quantity * item.goodsPrice;
    }
  
    order.totalQuantity = totalQuantity;
    order.total = total;
  }
  


  res.render("order",{
    wallet: wallet,
    user: user,
    orders: orders,
  });
});


  router.get("/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
    res.redirect("/login");
    return;
  }
  
  const user = await sql.getUser(req.user.username);
  const wallet = await sql.getWallet(user.walletId);
  res.render("payment",{
    wallet: wallet,
    user: user,
    orderId: req.params.id
  });
});


const multer = require('multer')
const receipts = multer.diskStorage({
  destination: 'public/images/receipts',
  filename: function (req, file, callback) {
    const originalname = file.originalname;
    const extension = originalname.split('.').pop(); // Get the file extension
    const filename = _.camelCase(originalname.replace(`.${extension}`, '')); // Remove extension and camelCase
    const finalFilename = `${filename}.${extension}`; // Add the extension back
    callback(null, finalFilename);
  },
});
const upload = multer({ storage: receipts })

router.post('/:id', upload.single('photo'), async (req, res) => {
  const path = req.file.path
  const updatPath = path.replace(`public`, '')
  await sql.queryPromise("UPDATE orders SET receipts=?, status=? WHERE orderId = ?", [
    updatPath , 'รอการยืนยันการชำระเงิน',req.params.id
  ]);
  res.redirect("/order")
})




module.exports = router;