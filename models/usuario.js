var mongoose = require('mongoose');
//antes de importar se descarga la libreria npm i mongoose-unique-validator --save
var uniqueValidator= require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var rolesValidos={
    values:['ADMIN_ROLE','USER_ROLE'],
    message:'{VALUE} no es un rol permitido'
};

//dentro de la funcion new Schema va un objeto con la configuracion(los campos del squema y sus condiciones)
var usuarioSchema= new Schema({
    nombre:{ type: String, required:[true,'El nombre es requerido']},
    email:{ type: String, unique:true, required:[true,'El correo es requerido']},
    password:{ type: String, required:[true,'El password es requerido']},
    img:{ type: String, required:false},
    role:{type: String, required:true,default:'USER_ROLE',enum:rolesValidos}   
});

//digo que en el esquema va a estar el uniqueValidator
usuarioSchema.plugin(uniqueValidator, { message:'El {PATH} debe ser unico'});

//exportamos el schema dentro del mongoose.model() enviamos dos campos
//el primero es el nombre que queremos que tenga el schema fuera del archivo y el segundo es el schema a exportar
module.exports= mongoose.model('Usuario',usuarioSchema);
