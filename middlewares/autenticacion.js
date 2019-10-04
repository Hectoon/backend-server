var jwt = require('jsonwebtoken');
//importo la variable SEED desde las configuraciones y la asigno
var SEED = require('../config/config').SEED;

//=========================================
// Verificar token
//=========================================

exports.verificaToken= function(req,res,next){

    var token = req.query.token;
    //el primer parametro es el token recibido
    //el segundo es la semilla(el valor para hacer la codificacion unica)
    //el tercero es un callback que tiene un error y el decoded(que es la informacion del usuario)
    jwt.verify(token, SEED, (err,decoded)=>{
        if (err) {
            return res.status(401).json({
                ok:false,
                Mensaje: 'Token incorrecto',
                errors:err
            });
        }
        //extrigo el usuario que hizo la peticion (el usuario que se valido en el login y creo el token)
        req.usuario = decoded.usuario;

        next();
    });

}
