const express = require('express')
const router = express.Router()
const usuariosController = require('../controllers/usuarios-controller')

router.delete('/excluir/:matricula', usuariosController.excluirUsuarios);
router.patch('/atualizar/:matricula', usuariosController.atualizaUsuario)
router.get('/localizar/:matricula', usuariosController.localizaUsuario)
router.get('/listar', usuariosController.listaUsuarios)
router.post('/cadastrar', usuariosController.cadastrarUsuarios)
router.post('/login', usuariosController.loginUsuario)

module.exports = router;