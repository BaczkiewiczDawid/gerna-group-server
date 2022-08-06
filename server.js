const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db_config = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
};

let db;

function handleDisconnect() {
  db = mysql.createConnection(db_config);

  db.connect(function (err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000);
    }
  });
  db.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

setInterval(function () {
  db.query("SELECT 1");
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
  const department = req.body.department;

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

app.post("/update-employee-information", (req, res) => {
  const data = req.body.data;

  const updateEmployeeInformation = `UPDATE gerna_employees SET name = '${data.name}', position = '${data.position}', age = '${data.age}', address='${data.address}', city = '${data.city}', phone_number='${data.phone_number}', salary = '${data.salary}' WHERE id = ${data.id}`;

  db.query(updateEmployeeInformation, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/new-employee", (req, res) => {
  const employeeData = req.body.data;

  const addNewEmployee = `INSERT INTO gerna_employees VALUES(null, '${employeeData.name}', '${employeeData.age}', '${employeeData.position}', '${employeeData.address}', '${employeeData.city}', '${employeeData.phone_number}', '${employeeData.email}', '${employeeData.salary}', '${employeeData.department}')`;

  db.query(addNewEmployee, (err, result) => {
    if (err) {
      console.log(err);
      res.status(400)
      res.send(result)
    } else {
      res.send(result);
    }
  });
});

app.get("/get-cars", (req, res) => {
  const getCarsList = `SELECT * FROM gerna_cars`;

  db.query(getCarsList, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/get-sales", (req, res) => {
  const carID = req.body.data;

  const getSales = `SELECT count(gerna_cars.id) as sales FROM gerna_cars, gerna_sales WHERE gerna_cars.id = gerna_sales.model AND gerna_cars.id = ${carID}`;

  db.query(getSales, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
      console.log(result);
    }
  });
});

app.get("/recent-sales", (req, res) => {
  const getRecentSales = `SELECT count(DATE_FORMAT(date, '%Y-%m-%d')) as sales FROM gerna_sales WHERE date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()`;

  db.query(getRecentSales, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/total-income", (req, res) => {
  const getTotalIncome = `SELECT sum(gerna_cars.price) as totalIncome FROM gerna_sales, gerna_employees, gerna_cars WHERE gerna_cars.id = gerna_sales.model AND gerna_sales.saler = gerna_employees.id`;

  db.query(getTotalIncome, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/recent-income", (req, res) => {
  const getRecentIncome = `SELECT sum(gerna_cars.price) as totalIncome, count(DATE_FORMAT(date, '%Y-%m-%d')) as sales FROM gerna_sales, gerna_employees, gerna_cars WHERE gerna_cars.id = gerna_sales.model AND gerna_sales.saler = gerna_employees.id AND date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()`;

  db.query(getRecentIncome, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

console.log("Server running");

app.listen(3001);
