const mysql = require('mysql')
const con = mysql.createConnection({
  host: 'cpanel14wh.bkk1.cloud.z.com',
  user: 'cp906134_vorkna',
  password: 'OpOr2546',
  database: 'cp906134_test'
})

// connection.connect()

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


module.exports = con;

