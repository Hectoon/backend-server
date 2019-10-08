//Requieres es para importar librerias internas o externas
var express= require('express');
// importo libreria para poder subir archivos
var fileUpload = require('express-fileupload');
//para poder eliminar la imagen antigua de la carpeta
var fs= require('fs');

//importamos los modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


//inicializar variables
var app = express();

app.use(fileUpload());


//tipo es a quien(medico,usuario,etc) le voy a subir la imegen id es el id del usuario que subio la imagen 
app.put('/:tipo/:id',(req,res,next)=>{

    var tipo= req.params.tipo;
    var id= req.params.id;

    //tipos de coleccion
    var tiposValidos= ['hospitales','medicos','usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok:false,
            mensaje:'Tipo coleccion no valida',
            error:{mensaje: 'Tipo coleccion no valida hospitales, medicos o usuarios'}
        });
    }

    //pregunto si es que vienen archivos req.files
    if (!req.files) {
        return res.status(400).json({
            ok:false,
            mensaje:'No selecciono nada',
            error:{mensaje: 'Debe selecciona runa imagen'}
        });
    }

    //obtener nombre del archivo
    var archivo= req.files.imagen;
    //extraigo la extencion del archivo
    var nombreCortado= archivo.name.split('.');//separa segun el caracter ingresado y cada parte la almacena en un arreglo
    var extensionArchivo= nombreCortado[nombreCortado.length -1];//pregunto por la posicion

    var extensionesValidas=['png','jpg','gif','jpeg'];
    //validacion de extencione
    //indexOf retorna el indice de el valor buscado si no lo encuentra retorna -1
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok:false,
            mensaje:'Extencion no valida',
            error:{mensaje: 'Debe seleccionar con extension png, jpg, gif o jpeg'}
        });
    }

    //nombre de archivo personalizado
    var nombreArchivo=`${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //mover el archivo a una carpeta en especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path,err=>{
        if (err) {
            return res.status(400).json({
                ok:false,
                mensaje:'Error al mover archivo',
                error:err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    
    });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id,(err,usuario)=>{
            if(err){
                return res.status(500).json({
                    ok:true,
                    Mensaje: 'Error al buscar imagen por id'
                });
            }
            if (!usuario) {
                return res.status(500).json({
                    ok:true,
                    Mensaje: usuario
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            console.log(pathViejo);

            //si existe, se elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img= nombreArchivo;

            usuario.save((err,usuarioActualizado)=>{

                usuarioActualizado.password= ':)';

                if(err){
                    return res.status(500).json({
                        ok:false,
                        Mensaje: 'Error al guardar imagen'
                    });
                }

                return res.status(200).json({
                    ok:false,
                    Mensaje: 'Imagen actualizada correctamente',
                    usuario: usuarioActualizado
                });
            })
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id,(err,medico)=>{
            if (err) {
                return res.status(500).json({
                    ok:true,
                    Mensaje: 'Error al buscar imagen por id'
                });
            }

            if (!medico) {
                return res.status(500).json({
                    ok:false,
                    Mensaje: 'El medico no se encuentra'
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img= nombreArchivo;

            medico.save((err,medicoActualizado)=>{
                if(err){
                    return res.status(500).json({
                        ok:false,
                        Mensaje: 'Error al guardar imagen'
                    });
                }

                return res.status(200).json({
                    ok:true,
                    Mensaje: 'Imagen actualizada correctamente',
                    usuario: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err,hospital)=>{
            if (err) {
                return res.status(500).json({
                    ok:true,
                    Mensaje: 'Error al buscar imagen por id'
                });
            }

            if (!hospital) {
                return res.status(500).json({
                    ok:false,
                    Mensaje: 'El hospital no se encuentra'
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img= nombreArchivo;

            hospital.save((err,hospitalActualizado)=>{
                if(err){
                    return res.status(500).json({
                        ok:true,
                        Mensaje: 'Error al guardar imagen'
                    });
                }

                return res.status(200).json({
                    ok:true,
                    Mensaje: 'Imagen actualizada correctamente',
                    usuario: hospitalActualizado
                });
            });

        });
    } 
}


module.exports = app;
