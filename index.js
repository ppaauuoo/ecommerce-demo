const express = require("express");
const app = express();
app.set("view engine", "ejs");

routes = require(__dirname + '/routes')
app.use('/', routes);



app.listen(process.env.PORT || 8888, function () {
  console.log("server start and running!");
});
