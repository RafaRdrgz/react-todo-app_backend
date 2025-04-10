const express = require('express');
const { errorController } = require('../controllers/errorController');
const { registerUser } = require('../controllers/registerController');

const RegisterRouter = express.Router(); // Inicializamos el router

// Crear un nuevo usuario (registro)
RegisterRouter.post('/register', async (req, res,next) => {

  const { name, email, password, google_id, auth_provider } = req.body;

 try{

     const respuesta = await registerUser(name, email, password, google_id, auth_provider, next);

     res.json(respuesta);

 } catch(error){

  console.error('Error registrando usuario:', error);
  return errorController('Error en el servidor', 500, next);

 }

});


module.exports = RegisterRouter;