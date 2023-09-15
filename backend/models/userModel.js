//// Eu não consegui adaptar ao Controlador, middleware e models até então. Logo a aplicação está toda rodando no server.js no backend.


const mysql = require('mysql');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "user"
});

module.exports = db;