//importando MYSQL
const mysql = require('mysql');

//criando connexão com o banco
var pool = mysql.createPool({
"user"     : process.env.MYSQL_USER,
"password" : process.env.MYSQL_PASSWORD, 
"database" : process.env.MYSQL_DATABASE,
"host"     : process.env.MYSQL_HOST,
"port"     : process.env.MYSQL_PORT 
})

//variavel de ambiente criado na aula 8

exports.pool = pool

