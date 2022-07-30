const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();

app.use(cors());

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
});

db.connect();

app.get("/top-selling-models", (req, res) => {
  const getTopSellingModels =
    "SELECT gerna_cars.id, gerna_cars.manufactuer, gerna_cars.model, gerna_cars.price, count(gerna_cars.id) as sales FROM gerna_sales, gerna_cars WHERE gerna_sales.model = gerna_cars.id GROUP BY gerna_cars.id ORDER BY sales DESC LIMIT 10";

  db.query(getTopSellingModels, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

app.get('/top-salers', (req, res) => {
  const getTopSalers = 'SELECT gerna_employees.id, gerna_employees.name, count(gerna_sales.saler) as totalSales, sum(gerna_cars.price) as totalIncome FROM gerna_sales, gerna_employees, gerna_cars WHERE gerna_cars.id = gerna_sales.model AND gerna_sales.saler = gerna_employees.id GROUP BY gerna_employees.id ORDER BY totalSales DESC LIMIT 10';

  db.query(getTopSalers, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  })
})

console.log("Server running");

app.listen(3001);
