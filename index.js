const express = require('express')
const ejs = require('ejs')


const app = express();
app.use(express.static("public"))
app.set('view engine','ejs')


app.get('/',function(req,res){
    res.render("home")
})

app.get('/test',function(req,res){
    res.render("goods_contents")
})

app.listen(process.env.PORT ||8000,function(){
    console.log("server start and running!")
})