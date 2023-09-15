//// Eu não consegui adaptar ao Controlador, middleware e models até então. Logo a aplicação está toda rodando no server.js no backend.

const express = require("express"); 
const router = express.Router();
const userController = require('../controllers/userController');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');

router.post('/cadastrar', userController.cadastrar);
router.post('/login', userController.login);
router.get('/usuarios',userController.usuarios);
router.delete('/deletar/:id', userController.deletar);
router.put('/editar/:id', userController.editar);

module.exports = router;
