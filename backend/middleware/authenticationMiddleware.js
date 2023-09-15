//// Eu não consegui adaptar ao Controlador, middleware e models até então. Logo a aplicação está toda rodando no server.js no backend.


const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, 'secret-key-shhhh', (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(403).json({ message: "Token inválido" });
    }
    req.user = decoded;
    next();
  });
};
