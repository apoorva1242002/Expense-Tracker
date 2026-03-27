const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "expense_tracker"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// Add expense manually
app.post("/add-expense", (req, res) => {
  const { title, amount, date, person } = req.body;

  const sql =
    "INSERT INTO expenses (title, amount, date, person) VALUES (?, ?, ?, ?)";

  db.query(sql, [title, amount, date, person], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error inserting expense");
    }

    res.send("Expense added successfully");
  });
});

// Get all expenses
app.get("/expenses", (req, res) => {
  const sql = "SELECT * FROM expenses ORDER BY date DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching expenses");
    }

    res.json(result);
  });
});

// Import expenses from website/API
app.get("/import-expenses", async (req, res) => {
  try {
    const response = await axios.get("https://dummyjson.com/carts");
    const carts = response.data.carts;

    const values = [];

    carts.forEach((cart) => {
      cart.products.forEach((product) => {
        values.push([
          product.title,
          product.price,
          new Date().toISOString().split("T")[0],
          `User-${cart.userId}`
        ]);
      });
    });

    if (values.length === 0) {
      return res.send("No data found to import");
    }

    const sql =
      "INSERT INTO expenses (title, amount, date, person) VALUES ?";

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error importing expenses");
      }

      res.send("Website data imported into database successfully");
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching website data");
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});