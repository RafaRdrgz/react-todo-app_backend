const express = require('express');
const { errorController } = require('../controllers/errorController');
const { generateAccessToken, generateRefreshToken, deleteUserRefreshTokens, refreshAccessToken } = require('../controllers/tokenController');
const {  authenticateJWT,authenticateRefreshJWT } = require('../middleware/authMiddleware');
const pool = require('../config/db'); // Importamos el pool para la base de datos
const { isPasswordValid } = require('../utils/validators');


const AuthRouter = express.Router(); // Inicializamos el router


//Recibo la petición login del frontend con el usuario y la contraseña a validar
AuthRouter.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {

        //Verificar si el usuario existe en la base de datos
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) { return errorController('Usuario no encontrado', 401, next); }

        const user = result.rows[0];

        if (!password || password.trim() === "") { return errorController('Contraseña no proporcionada', 401, next); }
        

        //Comparar la contraseña ingresada con la almacenada
        const validPassword = await isPasswordValid(password,user.password);

        if (!validPassword) { return errorController('Contraseña incorrecta', 401, next); }

        //Generar token de acceso y de refresco para el usuario
        const accessToken = await generateAccessToken(user);
        const refreshToken= await generateRefreshToken(user);

        //Retornamos al frontend ambos tokens
        return res.json({ accessToken, refreshToken });

    } catch (error) {

        console.error('Login error:', error);
        return errorController('Error en el servidor', 500, next);

    }
});


//Logout 
AuthRouter.post('/logout', authenticateJWT , async (req, res) => {

    const userId = req.user.id; // Tomar el ID del usuario desde el req.user de authenticateJWT

    try {

        await deleteUserRefreshTokens(userId);
        //console.log("cerrando sesión correctamente");
        res.json({ message: 'Sesión cerrada correctamente' });

    } catch (error) { return errorController('Error al cerrar sesión', 500, next); }

});


//Refrescar Access Token
AuthRouter.post('/refresh-token', authenticateRefreshJWT , async (req, res) => {
    try {

        const { refreshToken } = req.body;
        const newAccessToken = await refreshAccessToken(refreshToken);

        res.json({ accessToken: newAccessToken });

    } catch (error) {

        return errorController('No se pudo refrescar el token: ' + error.message, 403, next);

    }
});




module.exports = AuthRouter;