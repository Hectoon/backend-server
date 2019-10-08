var express= require('express');
//antes de importar se descarga la libreria npm install bcryptjs --save
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//importo la funcion de verificar token
var mdAutenticacion= require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//=========================================
// Obtener todos los usuarios
//=========================================

//Rutas la palabra viene de app = express();
app.get('/',(req,res,next)=>{
    //extraigo la variable desde para utilizarla en en el skip
    var desde= req.query.desde || 0;
    desde= Number(desde);

    //es Usuario es el del schema de usuarios
    //dentro del find({}) se coloca la condicion de busqueda y al lado de
    //este se coloca el resultado de la busqueda que viene como un callback find({},()=>{})
    //(err,usuarios) el primer campo es un error que regresa mongo y el otro es la respuesta al la busqueda
    Usuario.find({},'nombre email img role')
        //.skip() sirve para indicar cuantos datos se va a saltar
        .skip(desde)
        //.limit() es la cantidad maxima de datos que murstra
        .limit(5)
        .exec(
            (err,usuarios)=>{
            if (err) {
                res.status(500).json({
                    ok:false,
                    Mensaje: 'Error cargando usuarios',
                    errors:err
                });
            }

            //.count({}) es la funcion que cuenta la cantidad de archivos
            Usuario.count({},(err,conteo)=>{
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        Mensaje: 'Error al contar usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok:true,
                    usuarios:usuarios,
                    total: conteo
                });
            });

    })
});


//=========================================
// Actualizar usuario
//=========================================
app.put('/:id',mdAutenticacion.verificaToken,(req,res)=>{

    //el req.params son los valores que vienen en el URL
    var id= req.params.id;
    //req.body trae todos los valores dentro del "formulario x-www-form-urlencoded"
    var body = req.body;

    Usuario.findById(id,(err,usuario)=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                Mensaje: 'Error buscar usuario',
                errors:err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok:false,
                Mensaje: 'El usuario con el' + id + 'no existe',
                errors: {message:'No existe el usuario con ese id'}
            });
        }

        usuario.nombre= body.nombre;
        usuario.email= body.email;
        usuario.role= body.role;

        usuario.save((err,usuarioGuardado)=>{
            if (err) {
                return res.status(500).json({
                    ok:false,
                    Mensaje: 'Error al actualizar usuario',
                    errors:err
                });
            }

            //reemplazamos el valor del pass para que no lo devuelva
            usuarioGuardado.password=':)'

            res.status(200).json({
                ok:true,
                usuario:usuarioGuardado
            });
        });
    });
});

//=========================================
// Crear un nuevo usuario
//=========================================
app.post('/', mdAutenticacion.verificaToken, (req,res)=>{
    //el .body viene del bodyParser del archivo raiz app.js
    var body = req.body;

    //creo una variable para relacionar los datos recividos del post al schema usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email:body.email,
        password:bcrypt.hashSync(body.password,10),
        img: body.img,
        role: body.role
    });

    //guardo el usuario en mongo db 
    //en el callback el primero es el error y el otro es la respuesta de que se almaceno con exito
    usuario.save((err,usuarioGuardado)=>{
        if (err) {
            res.status(400).json({
                ok:false,
                Mensaje: 'Error cargando usuarios',
                errors:err
            });
        }

        res.status(201).json({
            ok:true,
            usuario:usuarioGuardado,
            //extrigo el usuario que hizo la peticion (el usuario que se valido en el login y creo el token)
            usuariotoken: req.usuario
        });
    });
})

//=========================================
// Eliminar usuario por id
//=========================================
app.delete('/:id',mdAutenticacion.verificaToken,(req,res)=>{
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err,usuarioBorrado)=>{
        if (err) {
            res.status(500).json({
                ok:false,
                Mensaje: 'Error borrar usuario',
                errors:err
            });
        }

        if (!usuarioBorrado) {
            res.status(400).json({
                ok:false,
                Mensaje: 'No existe un usuario con ese id usuario',
                errors: {message:'No existe un usuario con ese id usuario'}
            });
        }

        res.status(201).json({
            ok:true,
            usuario:usuarioBorrado
        });
    });
})


module.exports = app;
