var express= require('express');

var app= express();

var Medico = require('../models/medico');

var mdAutenticacion= require('../middlewares/autenticacion');


//=========================================
// Obtener medicos
//=========================================
app.get('/',(req,res)=>{
    var desde= req.query.desde || 0;
    desde= Number(desde);

    Medico.find({})
    //.skip() sirve para indicar cuantos datos se va a saltar
    .skip(desde)
    //.limit() es la cantidad maxima de datos que murstra
    .limit(5)
    //para asociar x tablas se veben colocar x .populate()
    //si se necesitan todos losn datos de una tabla solo se llama a esta
    .populate('usuario','nombre email')
    .populate('hospital')
    .exec(
    (err,medico)=>{
        if (err) {
            res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar medico',
                error:err
            });
        }
        if (!medico) {
            res.status(400).json({
                ok:false,
                mensaje:'No hay medicos ingresados'
            });
        }
        
        Medico.count({},(err,conteo)=>{
            if (err) {
                return res.status(500).json({
                    ok:false,
                    Mensaje: 'Error al contar medicos',
                    errors: err
                });
            }

            res.status(200).json({
                ok:true,
                medico:medico,
                total: conteo
            });
        });

        
    });
});


//=========================================
// Crear medico
//=========================================
app.post('/', mdAutenticacion.verificaToken,(req,res)=>{
    
    var body= req.body;
    var usuario= req.usuario;

    var medico = new Medico({
       nombre:body.nombre,
       usuario: usuario,
       hospital: body.hospital 
    });

    medico.save((err,medicoGuardado)=>{
        if (err) {
            res.status(500).json({
                ok:false,
                mensaje: 'Error al guardar medico',
                error:err
            });
        }

        res.status(200).json({
            ok:true,
            mensaje:'Se almaceno con exito el medico',
            medico:medicoGuardado
        });
    });
});

//=========================================
// Actualizar medico
//========================================= 
app.put('/:id', mdAutenticacion.verificaToken,(req,res)=>{

    var id = req.params.id;
    var body= req.body
    var usuario= req.usuario;

    var medico={
        nombre: body.nombre,
        usuario: usuario,
        hospital: body.hospital
    }

    Medico.findByIdAndUpdate(id,medico,(err,medicoActualizado)=>{
        if (err) {
            res.status(500).json({
                ok:false,
                mensaje: 'Error al Actualizar medico',
                error:err
            });
        }
        if (!medicoActualizado) {
            res.status(400).json({
                ok:false,
                mensaje: 'No se encontro el medico'
            });
        }

        res.status(200).json({
            ok:true,
            mensaje:'Se actualizo con exito',
            medico: medicoActualizado
        })
    })

});

//=========================================
// Borrar medico
//=========================================
app.delete('/:id',mdAutenticacion.verificaToken,(req,res)=>{
    var id= req.params.id;

    Medico.findByIdAndRemove(id,(err,medicoEliminado)=>{
        if (err) {
            res.status(500).json({
                ok:false,
                mensaje: 'Error al Eliminar medico',
                error:err
            });
        }
        if (!medicoEliminado) {
            res.status(400).json({
                ok:false,
                mensaje: 'No se encontro el medico'
            });
        }
        res.status(200).json({
            ok:true,
            mensaje:'Se Elimino con exito',
            medico: medicoEliminado
        })
    });
});

module.exports=app;