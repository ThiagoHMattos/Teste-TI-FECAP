const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const app = express();
app.use(cors());
app.use(express.json());

//Conectado ao Banco de Dados.
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:  "",
    database: "user"
})

//Pegando a requisição do frontend e escrevendo no banco de dados além de utilizar hash por segurança às senhas
app.post('/cadastrar',async  (req, res)=> {
    const name = req.body.name
    const email = req.body.email
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password.toString(), salt)


    const values = [name, email, password]
    
  db.query("SELECT * FROM login WHERE email = ?", [req.body.email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro Interno do Servidor" });
    }
    //aqui ele verifica se o e-mail já foi registrado no banco de dados. (Regra de Negócio)
    if (result.length > 0) {
      return res.status(400).json({ message: "Este e-mail já esta presente no nosso sistema, utilize outro!" });
    }

    db.query("INSERT INTO login (name, email, password) VALUES (?)", [values], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro Interno do Servidor" });
      }

      return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    });
  });

})

//Pegando a requisição do frontend e comparando no banco de dados para autenticar o usuário. Ainda tem a comparação da senha com hash e a Autenticação JWT.

app.post('/login', (req, res)=> {
    const email = req.body.email; 
    const password = req.body.password.toString()
    db.query("SELECT * FROM login WHERE email = ?", [email], async (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erro Interno do Servidor" });
        }

        if (result.length > 0) {
            const usuarioPermitido = await bcrypt.compare(password, result[0].password); 

            if (usuarioPermitido) {
                const accessToken = jwt.sign({ id: result[0].id, name: result[0].name }, 'secret-key-shhhh');
                return res.status(200).send({ accessToken: accessToken, name: result[0].name});
            } else {
                return res.status(401).send('Usuário não encontrado ou senha Inválida.');
            }
        } else {
            return res.status(401).send('Usuário não encontrado ou senha Inválida.');
        }
    });
});

//aqui ele pega todos os usuários já cadastrados.
app.get('/usuarios', (req, res) => {
    db.query("SELECT * FROM login", (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ message: "Erro interno do Servidor."})

        } 
        return res.status(200).json(result);
    })
})
//aqui ele elimina um dos Usuários cadastrados.
app.delete("/deletar/:id", (req, res) => {
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
  });

  //aqui há  a edição de um usuário.
  app.put("/editar/:id", (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const id = req.params.id;
  
    db.query("UPDATE login SET name = ?, email = ? WHERE id = ?",[name, email, id],( err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erro Interno do Servidor" });
        }
  
        return res.status(200).json({ message: "Usuário editado com sucesso!" });
      }
    );
  });
  
  

app.listen(8081, ()=> {
    console.log("o Backend está rodando na seguinte porta: 8081")
})