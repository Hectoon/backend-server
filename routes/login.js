const express = require('express');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
//importo la variable SEED desde las configuraciones y la asigno
var SEED = require('../config/config').SEED;


const app = express();
var Usuario = require('../models/usuario');


app.post('/',(req,res)=>{
    var body= req.body;

    Usuario.findOne({email: body.email},(err, usuarioDB)=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                Mensaje: 'Error buscar usuario',
                errors:err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok:false,
                Mensaje: 'Credenciales Incorrectas - email',
                errors: err
            });
        }
    
        //tomo el string y lo comparao con otro que ya paso por el bcrypt regresa true o false
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok:false,
                Mensaje: 'Credenciales Incorrectas - password',
                errors: err
            });
        }

        usuarioDB.password=':)';
        //crear token
        //el primer valor dentro del jwt.sign() es la data que se quiere colocar en el token
        //el segundo es la SEED la cual es la llave secreta del token
        //el tercero es la fecha de expiracion del token en segundos
        var token = jwt.sign({usuario: usuarioDB},SEED,{expiresIn:14400});//4 horas
    
        res.status(200).json({
            ok:true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    });
    
});


module.exports=app;