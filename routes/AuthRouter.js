const express = require('express');
const bcrypt = require('bcryptjs'); // Importamos bcryptjs para cifrar la contraseñas
const { generateAccessToken, generateRefreshToken, deleteUserRefreshTokens, refreshAccessToken } = require('../controllers/tokenController');
const {  authenticateJWT,authenticateRefreshJWT } = require('../middleware/authMiddleware');
const pool = require('../config/db'); // Importamos el pool para la base de datos


const AuthRouter = express.Router(); // Inicializamos el router


//Recibo la petición login del frontend con el usuario y la contraseña a validar
AuthRouter.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {

        //Verificar si el usuario existe en la base de datos
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];


        if (!password || password.trim() === "") {
            return res.status(401).json({ message: 'Contraseña no proporcionada' });
        }
        

        //Comparar la contraseña ingresada con la almacenada
        const validPassword = await isPasswordValid(password,user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        //Generar token de acceso y de refresco para el usuario
        const accessToken = await generateAccessToken(user);
        const refreshToken= await generateRefreshToken(user);

        //Retornamos al frontend ambos tokens
        return res.json({ accessToken, refreshToken });

    } catch (error) {

        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });

    }
});


//Logout 
AuthRouter.post('/logout', authenticateJWT , async (req, res) => {

    const userId = req.user.id; // Tomar el ID del usuario desde el req.user de authenticateJWT

    try {
        await deleteUserRefreshTokens(userId);
        //console.log("cerrando sesión correctamente");
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


//Refrescar Access Token
AuthRouter.post('/refresh-token', authenticateRefreshJWT , async (req, res) => {
    try {

        const { refreshToken } = req.body;
        const newAccessToken = await refreshAccessToken(refreshToken);

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'No se pudo refrescar el token' + error.message });
    }
});


const isPasswordValid= async (password, userPassword) => {return await bcrypt.compare(password, userPassword);}


module.exports = AuthRouter;