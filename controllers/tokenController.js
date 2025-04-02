const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/config');


// Generar Access Token (expira en 1hora)
const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
  };


// Generar Refresh Token (expira en 7 días)
const generateRefreshToken = async (user) => {

    try{

        const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Primero, eliminamos los tokens antiguos del usuario
        await deleteUserExpiredRefreshTokens(user.id);

        // Guardar el nuevo refresh token con una fecha de expiración
        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
            [user.id, newRefreshToken]
        );

        return newRefreshToken;


    } catch (error) {

        console.error('Error generando Refresh Token:', error);
        throw new Error('Error generando el refresh token');
    }

};


// Eliminar todos los refresh tokens de un usuario (al cerrar sesión o crear un nuevo refresh token)
const deleteUserRefreshTokens = async (userId) => {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};


// Eliminar un refresh token específico
const deleteRefreshToken = async (token) => {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

//Eliminar refresh tokens expirados
const deleteUserExpiredRefreshTokens = async (userId) => {

    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()', [userId]);

}


// Validar Refresh Token y generar nuevo Access Token
const refreshAccessToken = async (refreshToken) => {

    try {
        // Verificar el refresh token
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        // Buscar en la base de datos
        const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);

        if (result.rows.length === 0) {
            throw new Error('Refresh token inválido');
        }

        const userId = result.rows[0].user_id;

        // Doble verificación: asegurarse de que el token pertenece al usuario
        if (userId !== decoded.id) {
            throw new Error('Refresh token inválido');
        }
        
        // Generar nuevo access token
        const newAccessToken = generateAccessToken({ id: userId });

        return newAccessToken;

    } catch (error) {
        throw new Error('Refresh token expirado o inválido');
    }

};


module.exports = {

    generateAccessToken,
    generateRefreshToken,
    deleteUserRefreshTokens,
    deleteRefreshToken,
    refreshAccessToken
    
};