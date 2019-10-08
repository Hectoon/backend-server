var express= require('express');

var app= express();

var Hospital = require('../models/hospital');

var mdAutenticacion= require('../middlewares/autenticacion');


//=========================================
// Obtener todos los Hospitales
//=========================================
app.get('/',(req,res)=>{
    var desde= req.query.desde || 0;
    desde= Number(desde);

    Hospital.find({})
    //.skip() sirve para indicar cuantos datos se va a saltar
    .skip(desde)
    //.limit() es la cantidad maxima de datos que murstra
    .limit(5)
    //con populate() el primer campo es el nobre de la tabla que quiero relacionar
    //el segundo son los campos de la tabla que quiero traer
    .populate('usuario','nombre email')
    .exec(
    (err,hospital)=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buacar Hospital',
                error: err
            });
        }

        if (!hospital) {
            res.status(400).json({
                ok:false,
                mensaje:'No se encuentran hospitales ingresados'
            });
        }

        Hospital.count({},(err,conteo)=>{
            if (err) {
                return res.status(500).json({
                    ok:false,
                    Mensaje: 'Error al contar medicos',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital:hospital,
                total: conteo
            });
        });
    });
});


//=========================================
// crear Hospital
//=========================================
app.post('/',mdAutenticacion.verificaToken,(req,res)=>{
    var body= req.body;

    var usuario= req.usuario

    var hospital= new Hospital({
        nombre: body.nombre,
        usuario: usuario
    });

    hospital.save((err,hospitalCreado)=>{
        if (err) {
            res.status(500).json({
                ok:false,
                mensaje:"Error al crear el hoapital",
                error:err
            })
        }

        res.status(200).json({
            ok:true,
            mensaje:'Hospital creado',
            hospital:hospitalCreado
        })
    });
});

//=========================================
// Actualizar Hospital
//=========================================
app.put('/:id',mdAutenticacion.verificaToken,(req,res)=>{
    //el req.params son los valores que vienen en el URL
    var id= req.params.id;
    //req.body trae todos los valores dentro del "formulario x-www-form-urlencoded"
    var body = req.body;

    var hospital={
        nombre:body.nombre,
        usuario:req.usuario
    }

    Hospital.findByIdAndUpdate(id,hospital, (err,hospitalActualizado)=>{
        if (err) {
            res.status(500).json({
                ok:false,
                mensaje:'Error al actualizar',
                error: error
            })
        }

        if (!hospitalActualizado) {
            res.status(400).json({
                ok:false,
                mensaje:'No se encuentran hospitales con ese id'
            });
        }

        res.status(200).json({
            ok:true,
            mensaje: 'Se actualizo con exito',
            hospital:hospitalActualizado
        })
    }); 
});

//=========================================
// Eliminar hospital
//=========================================
app.delete('/:id',mdAutenticacion.verificaToken,(req,res)=>{
    var id = req.params.id;

    Hospital.findByIdAndRemove(id,(err,hospitalBorrado)=>{
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                error: err
            });
        }
        if (!hospitalBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'No se encontro el hospital',
            })
        }

        res.status(200).json({
            ok:true,
            mensaje: 'Se elimino con exito',
            hospital:hospitalBorrado
        })
    })
})


module.exports=app;