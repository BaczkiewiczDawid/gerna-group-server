const express = require('express');
const app = express();
const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB
})

db.connect();

console.log('Server running')

app.listen(3001)