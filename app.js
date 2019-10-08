//Requieres es para importar librerias internas o externas
var express = require('express');
var mongoose= require('mongoose');
var bodyParser = require('body-parser');


//inicializar variables
var app = express();

//bodyParser para poder capturar peticiones 
//parse application/x-www-form-urlencoded y las deja en formato json
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes= require('./routes/login');

var hospitalRoutes= require('./routes/hospital');
var medicoRoutes= require('./routes/medico');
var busquedaRoutes= require('./routes/busqueda');
var uploadRoutes= require('./routes/upload');
var imagenesRoutes= require('./routes/imagenes');



//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',(err,res)=>{
    if (err) {
        throw err;
    }

    console.log('Base de datos:\x1b[36m%s\x1b[0m', 'Online');
})

//el nuevo formato de connexion
/* mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
}); */

//rutas
app.use('/img',imagenesRoutes);
app.use('/upload',uploadRoutes);
app.use('/busqueda',busquedaRoutes);
app.use('/hospital',hospitalRoutes);
app.use('/medico',medicoRoutes);

app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);

//esta siempre tiene que ser la ultima ruta
app.use('/',appRoutes);





//escuchar peticiones
app.listen(3000, ()=>{
    console.log('Express server puerto 3000:\x1b[36m%s\x1b[0m', 'Online');//\x1b[36m%s\x1b[0m' es para cambiar el color
});
