const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const login = require('../middleware/login')

exports.excluirUsuarios = function(req, res, next){
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('DELETE FROM USUARIO WHERE MATRICULA = ?', [req.params.matricula],
            (error, result, field) => {
                conn.release()
                if (error) { return res.status(500).send({ error: error + "Usuário " + req.body.matricula + " não existe" }) }
                const response = {
                    mensagem: 'Usuario ' + req.body.matricula + ' excluído com sucesso!',
                }
                return res.status(202).send(response)
            }
        )
    })
}

exports.atualizaUsuario = function (req, res) {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'UPDATE USUARIO SET nome=?, email=?, id_curso=?, ativo=? WHERE matricula=?',
            [
                req.body.nome,
                req.body.email,
                req.body.id_curso,
                req.body.ativo,
                req.params.matricula
            ],
            (error, result, field) => {
                conn.release()
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Usuario atualizado com sucesso!',
                    usuarioAtualizado: {
                        matricula: req.body.matricula,
                        nome: req.body.nome,
                        email: req.body.email,
                        id_curso: req.body.id_curso,
                        ativo: req.body.ativo,

                    }
                }
                res.status(202).send(response)
            }
        )
    })
}


exports.localizaUsuario = function(req, res) {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM USUARIO WHERE MATRICULA = ?',
            [req.params.matricula],
            (error, result) => {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado usuario com esta matriucla'
                    })
                }
                const response = {
                    usuario: {
                        matricula: result[0].matricula,
                        nome: result[0].nome,
                        email: result[0].email,
                        id_curso: result[0].id_curso,
                        ativo: result[0].ativo,
                    }
                }
                return res.status(200).send(response)
            }
        )
    })
}


exports.listaUsuarios = function (req, res) {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(`SELECT * FROM USUARIO `,
            //o segundo parametro é onde fica armazenado o resultado da query pode ser usado quaquer nome 
            function (error, result) {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    quantidade: result.length,
                    Usuarios: result.map(usu => {
                        return {
                            matricula: usu.matricula,
                            nome: usu.nome,
                            email: usu.email,
                            id_curso: usu.id_curso,
                            ativo: usu.ativo,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de um usuario especifico',
                                url: 'http://localhost:3000/usuario/localiza/' + usu.matricula

                            }
                        }
                    })
                }
                return res.status(200).send(response)
            }
        )
    })
}


exports.cadastrarUsuarios = function (req, res) {
    mysql.getConnection(function (error, conn) {
        if (error) { return res.status(500).send({ erro: error }) }
        conn.query('SELECT * FROM USUARIO WHERE matricula = ?',
            [req.body.matricula],
            function (error, result) {
                if (error) { return res.status(500).send({ error: error }) }
                if (result.length > 0) {
                    res.status(409).send({ mensagem: 'Usuário já cadastrado NodeJS' })
                } else {
                    bcrypt.hash(req.body.senha, 10, function (errBcrypt, hash) {
                        if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                        conn.query('INSERT INTO USUARIO (matricula, nome, email, senha, id_curso, ativo) VALUES (? ,?, ?, ?, ?, ?)',
                            [
                            req.body.matricula, req.body.nome, req.body.email, 
                            hash, req.body.id_curso, req.body.ativo
                            ],
                            function (error, result) {
                                conn.release()
                                if (error) { return res.status(500).send({ error: error }) }
                                var response = {
                                    mensagem: 'Usuário criado com sucesso em nodejs!',
                                    usuarioCriado: {
                                        matricula: req.body.matricula,
                                        nome: req.body.nome,
                                        email: req.body.email,
                                        id_curos: req.body.id_curso,
                                        ativo: req.body.ativo
                                    }
                                }
                                return res.status(201).send({ response })
                            })
                    })
                }
            })
    })
}

exports.loginUsuario = function(req, res, next) {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM USUARIO WHERE matricula = ? `;
        conn.query(query, [req.body.matricula], (error, results, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação!' })
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação!' })
                }
                if (result) {
                    const token = jwt.sign({
                        id_usuario: results[0].matricula,
                        nome: results[0].email
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        });
                    return res.status(200).send({
                        mensagem: 'Autenticado com sucesso',                       
                        token: token
                    });
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação!' })
            });
        });
    });
}