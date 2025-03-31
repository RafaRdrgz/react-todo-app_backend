const { JWT_SECRET } = require('./config'); //Clave para firmar los JWT
const express = require('express');
const bcrypt = require('bcryptjs'); // Importamos bcryptjs para cifrar la contraseñas
const jwt = require('jsonwebtoken'); // Para trabajar con JWT
const pool = require('../config/db'); // Importamos el pool para la base de datos


const LoginRouter = express.Router(); // Inicializamos el router

//Recibo la petición login del frontend con el usuario y la contraseña a validar
LoginRouter.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {

        //Verificar si el usuario existe en la base de datos
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid user or pasword' });
        }

        const user = result.rows[0];

        //Comparar la contraseña ingresada con la almacenada
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid user or password' });
        }

        //Generar un token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '2h' } // Expira en 2 horas
        );

        //Si todo es correcto:
        //Enviar el token y los datos del usuario
        res.json({ token, user });

    } catch (error) {

        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });

    }
});


module.exports = LoginRouter;