const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


routes = require('./routes')
app.use('/', routes);



app.listen(process.env.PORT || 8888, function () {
  console.log("server start and running!");
});
