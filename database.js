const mysql = require('mysql')
const con = mysql.createConnection({
  host: 'ps01.zwhhosting.com',
  user: 'zqfpszwh_vorkna',
  password: 'OpOr2546-9',
  database: 'zqfpszwh_test'
})

// connection.connect()

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


module.exports = con;

