const express = require('express');
const bcrypt = require('bcryptjs'); // Importamos bcryptjs para cifrar la contraseñas
const jwt = require('jsonwebtoken'); // Para trabajar con JWT
const { generateAccessToken, generateRefreshToken, deleteUserTokens, refreshAccessToken } = require('../controllers/tokenController');
const pool = require('../config/db'); // Importamos el pool para la base de datos


const AuthRouter = express.Router(); // Inicializamos el router


//Recibo la petición login del frontend con el usuario y la contraseña a validar
AuthRouter.post('/login', async (req, res) => {

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

        //Generar token de acceso y de refresco para el usuario
        const accessToken = generateAccessToken(user);
        const refreshToken= generateRefreshToken(user);


        //Retornamos al frontend ambos tokens
        res.json({ accessToken, refreshToken });

    } catch (error) {

        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });

    }
});


//Logout 
router.post('/logout', async (req, res) => {
    const { userId } = req.body;
    try {
        await deleteUserTokens(userId);
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


//Refrescar Access Token
router.post('/refresh-token', authenticateRefreshJWT, async (req, res) => {
    try {
        const newAccessToken = await refreshAccessToken(req.body.refreshToken);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
});



module.exports = LoginRouter;