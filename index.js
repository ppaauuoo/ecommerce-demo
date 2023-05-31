const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const _ = require('lodash')

const app = express();
app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))

//dataPlaceholder
const goods = [{
    goodsName: "test1",
    goodsPrice: "2",
    goodsDesc: "testdesc1",
    goodsReview: "testrevew"
},{
    goodsName: "good2",
    goodsPrice: "25",
    goodsDesc: "qwertyuiop[]",
    goodsReview: "65"
  },{
    goodsName: "good3",
    goodsPrice: "57",
    goodsDesc: "qwertyuiop[]",
    goodsReview: "253"
  }]

let cart = [{
    goodsName: "test1",
    goodsPrice: 2,
    goodsDesc: "testdesc1",
    goodsQuantity: 2,
    goodsSubTotal: 2*2
}]
let total=4;

app.get('/',function(req,res){
    res.render("home",{
        goods: goods
    })
})

app.post('/',function(req,res){
    const requestGoods=req.body.Selecteditem
    //check dupe in cart
    cart.forEach((carttemp)=>{
        if(carttemp.goodsName==requestGoods){
            total-=carttemp.goodsSubTotal
            carttemp.goodsQuantity+=1;
            carttemp.goodsSubTotal=carttemp.goodsPrice*carttemp.goodsQuantity;
            total+=carttemp.goodsSubTotal
            res.redirect('/')
        }
    })
    //get anoother atrr
    goods.forEach((element)=>{
        if(element.goodsName==requestGoods){
            cart.push({
                goodsName: element.goodsName,
                goodsPrice: element.goodsPrice,
                goodsDesc: element.goodsDesc,
                goodsQuantity: 1,
                goodsSubTotal: element.goodsPrice
                })
                total+=element.goodsPrice
            res.redirect('/')
        }
    })
    
})



app.get('/cart',function(req,res){
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