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
    "SELECT gerna_cars.manufactuer, gerna_cars.model, gerna_cars.price, count(gerna_cars.id) as sales FROM gerna_sales, gerna_cars WHERE gerna_sales.model = gerna_cars.id GROUP BY gerna_cars.id ORDER BY sales DESC LIMIT 10";

  db.query(getTopSellingModels, (err, result) => {
    if (err) {
      throw err;
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

console.log("Server running");

app.listen(3001);
