const mysql = require('mysql2');

const db = mysql.createPool({
    host:'localhost',
    user:'root',
    database:'db_perekrutan',
    password:''
});

module.exports = db.promise();