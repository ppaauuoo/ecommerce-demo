const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const _ = require('lodash')
const mongoose = require('mongoose');

const app = express();
app.use(express.static("public"))

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopDB');
  }

const GoodsSchema = new mongoose.Schema({
    goodsName: String,
    goodsPrice: Number,
    goodsDesc: String,
    goodsReview: Number
});

const Goods = mongoose.model('Goods', GoodsSchema);

//data placeholder
const product1 = new Goods({
    goodsName: "test1",
    goodsPrice: 2,
    goodsDesc: "testdesc1",
    goodsReview: 2
})

const product2 = new Goods({
    goodsName: "good2",
    goodsPrice: 25,
    goodsDesc: "qwertyuiop[]",
    goodsReview: 65
})

const product3 = new Goods({
    goodsName: "good3",
    goodsPrice: 57,
    goodsDesc: "qwertyuiop[]",
    goodsReview: 253
})

const demoProduct = [product1,product2,product3]

//cart
const CartSchema = new mongoose.Schema({
    goodsName: String,
    goodsPrice: Number,
    goodsDesc: String,
    goodsQuantity: Number,
    goodsSubTotal: Number
});

const Cart = mongoose.model('Cart', CartSchema);

const democart = new Cart({
    goodsName: "test1",
    goodsPrice: 2,
    goodsDesc: "testdesc1",
    goodsQuantity: 2,
    goodsSubTotal: 2*2
})


app.get('/',async (req,res)=>{

    const product = await Goods.find({})

    if(product.length==0){
        await Goods.insertMany(demoProduct)
        await democart.save()
    }

    res.render("home",{
    goods: product
   })
})

app.post('/', async (req,res) => {
    const requestGoods=req.body.Selecteditem
    const cart = await Cart.find({goodsName: requestGoods});
    const product = await Goods.find({goodsName: requestGoods});

    console.log(cart)
    if(cart[0]){
        const newQuantity=cart[0].goodsQuantity+1
        const newSubTotal=cart[0].goodsPrice*cart[0].goodsQuantity;
        await Cart.findOneAndUpdate({goodsName: requestGoods},{goodsQuantity: newQuantity, goodsSubTotal: newSubTotal},{returnOriginal:false})
        console.log('got dupe')
    }else{
        const newCart = new Cart({
            goodsName: product[0].goodsName,
            goodsPrice: product[0].goodsPrice,
            goodsDesc: product[0].goodsDesc,
            goodsQuantity: 1,
            goodsSubTotal: product[0].goodsPrice
        });
        await newCart.save()
        console.log('got new stuff')
    }

    res.redirect('/')
    
})



app.get('/cart', async (req,res) => {
    const cart = await Cart.find({})
    let total = 0;
    cart.forEach((element) => {
        total+=element.goodsSubTotal
    })
    res.render("cart",{
        cart: cart,
        total: total
    })
})

app.get('/cart',function(req,res){
    res.redirect("/cart")
})


app.listen(process.env.PORT ||8000,function(){
    console.log("server start and running!")
})