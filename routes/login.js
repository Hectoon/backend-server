const express = require('express');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
//importo la variable SEED desde las configuraciones y la asigno
var SEED = require('../config/config').SEED;


const app = express();
var Usuario = require('../models/usuario');

//Google
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
var CLIENT_ID = require('../config/config').CLIENT_ID;



//=========================================
// Autenticacion Google
//=========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    //payload tiene toda la informacion del usuario
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre:payload.name,
        email:payload.email,
        img: payload.picture,
        google: true
    }
  }
  
app.post('/google', async(req,res)=>{

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(err=>{
            return res.status(403).json({
                ok:false,
                Mensaje: 'Token no valido',
                errors:err
            });
        });

    Usuario.findOne({email: googleUser.email},(err,usuarioDB)=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                Mensaje: 'Error buscar usuario',
                errors:err
            });
        }
        if (usuarioDB) {
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok:false,
                    Mensaje: 'Debe usar su autenticacion normal'
                });
            }else{
                var token = jwt.sign({usuario: usuarioDB},SEED,{expiresIn:14400});//4 horas
    
                res.status(200).json({
                    ok:true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });
            }
        }else{
            //el usuario no exixte y se autentica por google... Hay que crearlo
            var usuario= new Usuario();
            usuario.nombre= googleUser.nombre;
            usuario.email= googleUser.email;
            usuario.img= googleUser.img;
            usuario.google= true;
            usuario.password= ':)'; //como se autentico por google no nesecita contraseña

            usuario.save((err,usuarioDB)=>{
                if (err) {                  
                    return res.status(500).json({
                        ok:false,
                        Mensaje: 'No se pudo guardar usuario google',
                        errors:err
                    });
                }

                var token = jwt.sign({usuario: usuarioDB},SEED,{expiresIn:14400});//4 horas
    
                res.status(200).json({
                    ok:true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });
            });
        }
    })

   /*  res.status(400).json({
        ok: 'sdkfpkds',
        googleUser:googleUser
    }) */

});








//=========================================
// Autenticacion Normal
//=========================================
app.post('/',(req,res)=>{
    var body= req.body;

    Usuario.findOne({email: body.email},(err, usuarioDB)=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                Mensaje: 'Error buscar usuario',
                errors:err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok:false,
                Mensaje: 'Credenciales Incorrectas - email',
                errors: err
            });
        }
    
        //tomo el string y lo comparao con otro que ya paso por el bcrypt regresa true o false
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok:false,
                Mensaje: 'Credenciales Incorrectas - password',
                errors: err
            });
        }

        usuarioDB.password=':)';
        //crear token
        //el primer valor dentro del jwt.sign() es la data que se quiere colocar en el token
        //el segundo es la SEED la cual es la llave secreta del token
        //el tercero es la fecha de expiracion del token en segundos
        var token = jwt.sign({usuario: usuarioDB},SEED,{expiresIn:14400});//4 horas
    
        res.status(200).json({
            ok:true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    });
    
});


module.exports=app;