const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const db = mysql.createConnection({
//   host: process.env.HOST,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DB,
// });

// db.connect();

const db_config = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
}

let db;

function handleDisconnect() {
  db = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  db.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  db.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

setInterval(function () {
  db.query('SELECT 1');
}, 5000);

app.get("/top-selling-models", (req, res) => {
  const getTopSellingModels =
    "SELECT gerna_cars.id, gerna_cars.manufactuer, gerna_cars.model, gerna_cars.price, count(gerna_cars.id) as sales FROM gerna_sales, gerna_cars WHERE gerna_sales.model = gerna_cars.id GROUP BY gerna_cars.id ORDER BY sales DESC LIMIT 10";

  db.query(getTopSellingModels, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/top-salers", (req, res) => {
  const getTopSalers =
    "SELECT gerna_employees.id, gerna_employees.name, count(gerna_sales.saler) as totalSales, sum(gerna_cars.price) as totalIncome FROM gerna_sales, gerna_employees, gerna_cars WHERE gerna_cars.id = gerna_sales.model AND gerna_sales.saler = gerna_employees.id GROUP BY gerna_employees.id ORDER BY totalSales DESC LIMIT 10";

  db.query(getTopSalers, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/employees-list", (req, res) => {
  const department = req.body.department

  const getEmployeesList = `SELECT id, name, age, position FROM gerna_employees WHERE department = '${department}'`;

  db.query(getEmployeesList, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/employee-details", (req, res) => {
  const selectedUser = req.body.selectedUser;

  const getEmployeeDetails = `SELECT * FROM gerna_employees WHERE id = ${selectedUser}`;

  db.query(getEmployeeDetails, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

console.log("Server running");

app.listen(3001);
