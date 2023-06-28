var con = require("../database");

queryPromise = (query, values) => {
  return new Promise((resolve, reject) => {
    con.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.queryPromise = (query, values) => {
  return new Promise((resolve, reject) => {
    con.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.getUser = async (username) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users WHERE username=?",
      [username],
      (err, rows) => {
        if (rows) {
          resolve(rows[0]);
        }
        resolve(null);
      }
    );
  });
};

exports.getLength = async () => {
  return await new Promise((resolve, reject) => {
    con.query("SELECT COUNT(*) AS length FROM users", (err, rows) => {
      if (rows) {
        resolve(rows[0]);
      }
      resolve(null);
    });
  });
};

exports.getWallet = async (walletId) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM wallets WHERE walletId=?",
      [walletId],
      (err, rows) => {
        resolve(rows[0]);
      }
    );
  });
};

exports.getTree = async (username) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT t1.username AS lev1, t2.username AS lev2, t3.username AS lev3, t4.username AS lev4,t5.username AS lev5, t6.username AS lev6 FROM users t1 LEFT JOIN users t2 ON t2.username = t1.childrenL OR t2.username = t1.childrenR LEFT JOIN users t3 ON t3.username = t2.childrenL OR t3.username = t2.childrenR LEFT JOIN users t4 ON t4.username = t3.childrenL OR t4.username = t3.childrenR LEFT JOIN users t5 ON t5.username = t4.childrenL OR t5.username = t4.childrenR LEFT JOIN users t6 ON t6.username = t5.childrenL OR t6.username = t5.childrenR WHERE t1.username = ?",
      [username],
      (err, rows) => {
        if (err) {
          console.log(err);
        }

        resolve(rows);
      }
    );
  });
};

exports.getUserData = async (username) => {
  return await new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM users u LEFT JOIN addresses a ON u.addressId=a.addressId LEFT JOIN banks b ON u.bankId=b.bankId LEFT JOIN wallets w ON u.walletId=w.walletId WHERE u.username=?",
      [username],
      (err, rows) => {
        resolve(rows[0]);
      }
    );
  });
};

exports.getData = async (num) => {
  var row = 25;
  var amount = parseInt(row * num);
  if(num==-1){amount=0,row=1000000}
  return await queryPromise(
    "SELECT * FROM users u LEFT JOIN addresses a ON u.addressId=a.addressId LEFT JOIN banks b ON u.bankId=b.bankId LEFT JOIN wallets w ON u.walletId=w.walletId WHERE u.isAdmin!=1 LIMIT ?, ? ",
    [amount, row]
  );
};

exports.getSponsored = async (sponsor) => {
  return await queryPromise("SELECT * FROM users WHERE sponsor=?", [sponsor]);
};

exports.sponsorChild = async (sponsor) => {
  return await new Promise((resolve, reject) => {
    con.query(
      `SELECT COUNT(*) AS length FROM users WHERE sponsor = ?`,
      [sponsor],
      (err, rows) => {
        resolve(rows[0]);
      }
    );
  });
};

exports.getChild = async (userid) => {
  return new Promise((resolve, reject) => {
    const childLQuery = `SELECT COUNT(childrenL) AS length FROM users WHERE childrenL IS NOT NULL`;
    const childRQuery = `SELECT COUNT(childrenR) AS length FROM users WHERE childrenR IS NOT NULL`;

    const childLPromise = new Promise((resolve, reject) => {
      con.query(childLQuery, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0].length);
        }
      });
    });

    const childRPromise = new Promise((resolve, reject) => {
      con.query(childRQuery, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0].length);
        }
      });
    });

    Promise.all([childLPromise, childRPromise])
      .then(([childLlength, childRlength]) => {
        if (childLlength > childRlength) {
          con.query(
            "UPDATE users SET childrenR = ? WHERE childrenR IS NULL ORDER BY username ASC LIMIT 1",
            [userid],
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            }
          );
        } else {
          con.query(
            "UPDATE users SET childrenL = ? WHERE childrenL IS NULL ORDER BY username ASC LIMIT 1",
            [userid],
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            }
          );
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
