const express = require('express')
const app = express();
//const morgan = require('morgan') //criar logs
const bodyParser = require('body-parser')
 
const rotaUsuarios = require('./routes/usuario')
var cors = require('cors');

// use it before all route definitions
app.use(cors({origin: 'http://localhost:3000'}));

app.use(express.json())
app.use(bodyParser.urlencoded(
    { extended: false}))//aceita dados simples
app.use(bodyParser.json()) //so aceita json de entrada no body

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin','*')
                res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    if(req.method === 'OPTIONS'){
        req.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET')
        return res.status(200).send({})
    }
    next()
})
//app.use(morgan('dev'))
app.use('/usuarios',rotaUsuarios)


//quando não encontra rota
app.use((req, res, next)=>{
    const erro = new Error('Não encontrado')
    erro.status = 404
    next(erro)
})

app.use((error, req, res, next )=>{
    res.status(error.status || 500)
    return res.send({
        erro:{
            mensagem: error.message
        }
    })

})

module.exports = app;