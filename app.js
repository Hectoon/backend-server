//Requieres es para importar librerias internas o externas
var express = require('express');
var mongoose= require('mongoose');


//inicializar variables
var app = express();


//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',(err,res)=>{
    if (err) {
        throw err;
    }

    console.log('Base de datos:\x1b[36m%s\x1b[0m', 'Online');
})

/* mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
}); */


//Rutas 
app.get('/',(req,res,next)=>{
    res.status(200).json({
        ok:true,
        Mensaje: 'Peticion realizada correctamente'
    });
});





//escuchar peticiones
app.listen(3000, ()=>{
    console.log('Express server puerto 3000:\x1b[36m%s\x1b[0m', 'Online');//\x1b[36m%s\x1b[0m' es para cambiar el color
});
