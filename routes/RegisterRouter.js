const express = require('express');
const bcrypt = require('bcryptjs'); // Importamos bcryptjs para cifrar la contraseña
const pool = require('../config/db'); // Importamos el pool para la base de datos
const { generateAccessToken, generateRefreshToken } = require('../controllers/tokenController');

const RegisterRouter = express.Router(); // Inicializamos el router

// Crear un nuevo usuario (registro)
RegisterRouter.post('/register', async (req, res) => {
  const { name, email, picture, password, google_id, auth_provider } = req.body;

  // Validar que el correo electrónico tenga un formato correcto
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Correo electrónico inválido' });
  }

    // Verificar si la contraseña está presente
    // Si el proveedor de autenticación es "local", la contraseña es obligatoria
    if (auth_provider === 'local' && !password) {

      return res.status(400).json({ message: 'La contraseña es requerida para autenticación local' });
    }

  try {

    // Verificar si el usuario ya existe en la base de datos
    const userExists = await checkIfUserExists(email);

    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    //por defecto, la hashedPassword será null por si el auth_provider no es 'local'
    let hashedPassword = null;

    // Si el proveedor es local, ciframos la contraseña
    if (auth_provider === 'local') {
      
      hashedPassword = await bcrypt.hash(password, 10);

    }

        // Insertar el nuevo usuario en la base de datos
        const result = await pool.query(
          'INSERT INTO users (name, email, picture, password, google_id, auth_provider) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, picture',
            [name, email, picture, hashedPassword , google_id, auth_provider]
        );

    const user = result.rows[0];

    // Generar los tokens
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    // Devolver la respuesta con el usuario y los tokens
    return res.status(201).json({ message: 'Usuario registrado con éxito', user, accessToken, refreshToken });

  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', errorMessage: error.message });
  }
});

// Comprobar si el usuario ya está registrado
const checkIfUserExists = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length > 0;  // Retorna true si el correo ya está registrado
}

// Validar formato del correo electrónico
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);  // Retorna true si el correo tiene el formato correcto
}

module.exports = RegisterRouter;