//Requieres es para importar librerias internas o externas
var express= require('express');

//inicializar variables
var app = express();

var Hospital= require('../models/hospital');
var Medico= require('../models/medico');
var Usuario= require('../models/usuario');


//Rutas la palabra viene de app = express();
app.get('/todo/:busqueda',(req,res,next)=>{

    var busqueda= req.params.busqueda;
    //creo una exprecion regular para que la busqueda se realice sin tomar en cuenta mayusculas y minusculas
    //la i es para que no tome en cuenta mayusculas y minusculas
    var regex = new RegExp(busqueda,'i');

    //con Promise.all([]) se ejecuta un arreglo de promesas en simultaneo
    //las respuestas de cada una de estas promesas son segun su posicion en el arreglo
    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then( respuestas=>{
        res.status(200).json({
            ok:true,
            hospital:respuestas[0],
            medicos:respuestas[1],
            usuarios:respuestas[2]
        });
    });
});



app.get('/coleccion/:tabla/:busqueda',(req,res)=>{
    var tabla= req.params.tabla;
    var busqueda= req.params.busqueda;

    var regex = new RegExp(busqueda,'i');

   /*  ejercicio desarrollado por mi
   buscarPorTabla(busqueda, regex, tabla).then( respuestas=>{
        res.status(200).json({
            ok:true,
            hospital:respuestas,
        });
    });  */

    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa= buscarUsuarios(busqueda, regex);
            break;
        
        case 'hospital':
            promesa= buscarHospitales(busqueda, regex);
            break;

        case 'medico':
            promesa= buscarMedicos(busqueda, regex);
            break;  
    
        default:
            res.status(400).json({
                ok:false,
                hospital:'los tipos de busqueda solo son usuarios, medicos y hospitales',
                error:{mensaje: 'Tipo de tabla/coleccion no valido'}
            });
            break;
    }

    promesa.then(data=>{
        res.status(200).json({
            ok:true,
            //cuando lo dejo dentro de [tabla] quiere decir que estoy llamando al valor de la propiedad
            [tabla]:data,
        });
    })
});



/* ejercicio desarrollado por mi
function buscarPorTabla(busqueda, regex, tabla) {
    switch (tabla) {
        case 'hospital':
            return new Promise((resolve,reject)=>{
                Hospital.find({nombre: regex})
                    .populate('usuario','nombre email')
                    .exec((err,hospitales)=>{
                        if (err) {
                            reject('Error al cargar hospitales');
                        }else{
                            resolve(hospitales);
                        }
                }   );
            });       
        case 'medico':
            return new Promise((resolve,reject)=>{
                Medico.find({nombre: regex})
                    .populate('usuario','nombre email')
                    .populate('hospital')
                    .exec((err,medicos)=>{
                        if (err) {
                            reject('Error al cargar medicos');
                        }else{
                            resolve(medicos);
                        }
                }   );
            });   
        case 'usuario':
            return new Promise((resolve,reject)=>{
                Usuario.find({nombre: regex})
                    .populate('usuario','nombre email')
                    .populate('hospital')
                    .exec((err,medicos)=>{
                        if (err) {
                            reject('Error al cargar medicos');
                        }else{
                            resolve(medicos);
                        }
                }   );
            });
    }
} */


function buscarHospitales(busqueda, regex){
    return new Promise((resolve,reject)=>{
        Hospital.find({nombre: regex})
            .populate('usuario','nombre email')
            .exec((err,hospitales)=>{
                if (err) {
                    reject('Error al cargar hospitales');
                }else{
                    resolve(hospitales);
                }
        }   );
    });
}

function buscarMedicos(busqueda, regex){
    return new Promise((resolve,reject)=>{
        Medico.find({nombre: regex})
            .populate('usuario','nombre email')
            .populate('hospital')
            .exec((err,medicos)=>{
                if (err) {
                    reject('Error al cargar medicos');
                }else{
                    resolve(medicos);
                }
        }   );
    });
}


function buscarUsuarios(busqueda, regex){
    return new Promise((resolve,reject)=>{
        Usuario.find({},'nombre email role')
        //para buscar en dos campos de una tabla se ocupa la funcion 
        //.or([]) de mongoose que recive un arreglo de condiciones 
        //cada una de estas condiciones deven ser un objeto
        .or([{'nombre':regex},{'email':regex}])
        .exec((err,usuarios)=>{
            if (err) {
                reject('Error al cargar usuarios');
            }else{
                resolve(usuarios);
            }
        })           
    });
}

module.exports = app;
