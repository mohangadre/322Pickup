const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "BetsyZoeOlive2005"
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");

  connection.query("CREATE DATABASE IF NOT EXISTS pickup_ball", (err) => {
    if (err) throw err;
    console.log("Database created");

    connection.query("USE pickup_ball");

    const tableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(100),
        username VARCHAR(50) UNIQUE,
        email VARCHAR(100),
        phone VARCHAR(25),
        password VARCHAR(255)
      )
    `;

    connection.query(tableSQL, (err) => {
      if (err) throw err;
      console.log("Users table created");
      connection.end();
    });
  });
});