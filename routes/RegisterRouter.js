const express = require('express');
const { errorController } = require('../controllers/errorController');
const { generateAccessToken, generateRefreshToken } = require('../controllers/tokenController');
const { userExists, createUser } = require('../queries/userQueries');
const { validateEmail } = require('../utils/validators');

const RegisterRouter = express.Router(); // Inicializamos el router

// Crear un nuevo usuario (registro)
RegisterRouter.post('/register', async (req, res) => {

  const { name, email, picture, password, google_id, auth_provider } = req.body;

  // Validar que el correo electrónico tenga un formato correcto
  if (!email || !validateEmail(email)){ return errorController('Correo electrónico inválido', 400, next); }

  // Verificar si la contraseña está presente
  // Si el proveedor de autenticación es "local", la contraseña es obligatoria
  if (auth_provider === 'local' && !password) {

    return errorController('La contraseña es requerida para autenticación local', 400, next);

  }

  try {

    // Verificar si el usuario ya existe en la base de datos
    const exists = await userExists(email);

    if (exists) { return errorController('El correo ya está registrado', 400, next); }

    //por defecto, la hashedPassword será null por si el auth_provider no es 'local'
    let hashedPassword = null;

    // Si el proveedor es local, ciframos la contraseña
    if (auth_provider === 'local') {
      
      hashedPassword = await bcrypt.hash(password, 10);

    }

        // Insertar el nuevo usuario en la base de datos
    const newUser = await createUser(name, email, picture, hashedPassword, google_id, auth_provider);

    // Generar los tokens
    const accessToken = await generateAccessToken(newUser, next);
    const refreshToken = await generateRefreshToken(newUser, next);

    // Devolver la respuesta con el usuario y los tokens
    return res.status(201).json({ message: 'Usuario registrado con éxito', newUser, accessToken, refreshToken });

  } catch (error) {

    console.error('Error registrando usuario:', error);
    return errorController('Error en el servidor', 500, next);
    
  }
});


module.exports = RegisterRouter;