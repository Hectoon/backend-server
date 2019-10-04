//Requieres es para importar librerias internas o externas
var express= require('express');


//inicializar variables
var app = express();


//Rutas la palabra viene de app = express();
app.get('/',(req,res,next)=>{
    res.status(200).json({
        ok:true,
        Mensaje: 'Peticion realizada correctamente'
    });
});


module.exports = app;
