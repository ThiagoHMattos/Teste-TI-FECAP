//// Eu não consegui adaptar ao Controlador, middleware e models até então. Logo a aplicação está toda rodando no server.js no backend. Mas EStou Procurando Soluções pois sei que não é a melhor forma de apresentar.

const db = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.cadastrar = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password.toString(), salt);

  const values = [name, email, password];

  db.query("SELECT * FROM login WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro Interno do Servidor" });
    }
    if (result.length > 0) {
      return res.status(400).json({ message: "Este e-mail já está presente no nosso sistema, utilize outro!" });
    }

    db.query("INSERT INTO login (name, email, password) VALUES (?)", [values], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro Interno do Servidor" });
      }

      return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    });
  });
};

exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password.toString();

  db.query("SELECT * FROM login WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro Interno do Servidor" });
    }

    if (result.length > 0) {
      const usuarioPermitido = await bcrypt.compare(password, result[0].password);

      if (usuarioPermitido) {
        const accessToken = jwt.sign({ id: result[0].id, name: result[0].name }, 'secret-key-shhhh');
        return res.status(200).send({ accessToken: accessToken, name: result[0].name });
      } else {
        return res.status(401).send('Usuário não encontrado ou senha Inválida.');
      }
    } else {
      return res.status(401).send('Usuário não encontrado ou senha Inválida.');
    }
  });
};

exports.usuarios = (res) => {
  db.query("SELECT * FROM login", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro interno do Servidor." });
    }
    return res.status(200).json(result);
  });
};

exports.deletar = (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM login WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro Interno do Servidor" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      db.query(
        "DELETE FROM login WHERE id = ?",
        [id],
        (deleteErr) => {
          if (deleteErr) {
            console.error(deleteErr);
            return res.status(500).json({ message: "Erro Interno do Servidor" });
          }

          return res.status(200).json({ message: "Usuário deletado com sucesso!" });
        }
      );
    }
  );
};

exports.editar = (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const id = req.params.id;

  db.query("UPDATE login SET name = ?, email = ? WHERE id = ?", [name, email, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro Interno do Servidor" });
    }

    return res.status(200).json({ message: "Usuário editado com sucesso!" });
  });
};
