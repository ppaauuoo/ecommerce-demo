const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const _ = require('lodash')
const mongoose = require('mongoose');
const alert = require('alert')
const calculate = require(__dirname+'/calculate.js')



const app = express();
app.use(express.static("public"))

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb+srv://vorkna:OpOr2546@cluster0.vvkoeom.mongodb.net/shopDB');
  }

  //goods
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

//money placeholder
const WalletSchema = new mongoose.Schema({
    money: Number,
    point: Number,
    total: Number
})
const Wallet = mongoose.model('Wallet', WalletSchema)
const startWallet = new Wallet( {
    money: 0,
    point: 0,
    total: 0
})


app.get('/',async (req,res)=>{
    const wallet = await Wallet.find({})
    const product = await Goods.find({})


    if(product.length==0){
        await Goods.insertMany(demoProduct)
    }

    if(wallet.length==0){
        await startWallet.save()
    }
    res.render("home",{
        goods: product,
        wallet: wallet
   })
})

app.post('/', async (req,res) => {
    const requestGoods=req.body.selectedItem
    
    const cart = await Cart.find({goodsName: requestGoods});
    const product = await Goods.find({goodsName: requestGoods});


    if(cart.length>0){
        const newQuantity=cart[0].goodsQuantity+1
        const newSubTotal=cart[0].goodsPrice*newQuantity;
        await Cart.findOneAndUpdate({goodsName: requestGoods},{goodsQuantity: newQuantity, goodsSubTotal: newSubTotal},{returnOriginal:false})
        
    }else{
        const newCart = new Cart({
            goodsName: product[0].goodsName,
            goodsPrice: product[0].goodsPrice,
            goodsDesc: product[0].goodsDesc,
            goodsQuantity: 1,
            goodsSubTotal: product[0].goodsPrice
        });
        await newCart.save()

    }
    const currentCart = await Cart.find({});
    await Wallet.findOneAndUpdate({},{total: calculate.totalCalculate(currentCart)},{returnOriginal:false})
    res.redirect('/')
    
})


app.get('/cart', async (req,res) => {
    const cart = await Cart.find({})
    await Wallet.findOneAndUpdate({},{total: calculate.totalCalculate(cart)},{returnOriginal:false})
    const wallet = await Wallet.find({})
    
    res.render("cart",{
        cart: cart,
        wallet: wallet
    })
})

app.post('/cart',function(req,res){
    res.redirect("/cart")
})

app.get('/money', async (req,res) => {
    const wallet = await Wallet.find({})
    res.render("money",{
        wallet: wallet
    })
})

app.get('/money/add', async (req,res) => {
    const wallet = await Wallet.find({})
    await Wallet.findOneAndUpdate({},{money: wallet[0].money+100},{returnOriginal:false})
    res.redirect('/money')
})

app.get('/money/transfer', async (req,res) => {
    const wallet = await Wallet.find({})
    if(wallet[0].point>=100){
        await Wallet.findOneAndUpdate({},{money: wallet[0].money+20,point: wallet[0].point-100},{returnOriginal:false})
        alert("Success!");
        res.redirect('/money')
    }else{
        alert("Not Enough!");
        res.redirect('/money')
    }
})


app.get('/cart/checkout', async (req,res) => {
    const wallet = await Wallet.find({})
    if(wallet[0].money<wallet[0].total){
        alert("Not Enough!");
        res.redirect('/cart')
    }else{
        const pointObtained = calculate.pointCalculate(wallet[0].total)
        await Wallet.findOneAndUpdate({},{money: wallet[0].money-wallet[0].total,point: wallet[0].point+pointObtained},{returnOriginal:false})
        await Cart.deleteMany({ goodsSubTotal: { $gte: 0 } });
        alert("you got "+pointObtained+" point!");
        res.redirect('/')
    }
})

app.post('/cart/delete', async (req,res) => {
    const request2DeleteGoods=req.body.selected2DeleteItem
    await Cart.deleteOne({ goodsName: request2DeleteGoods });
    res.redirect('/cart')
})


app.listen(process.env.PORT ||8000,function(){
    console.log("server start and running!")
})