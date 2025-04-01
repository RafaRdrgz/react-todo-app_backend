const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/config');


// Generar Access Token (expira en 15 min)
const generateAccessToken = (user) => {

    return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
};


// Generar Refresh Token (expira en 7 días)
const generateRefreshToken = async (user) => {
    
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Guardar el refresh token en la base de datos
    await pool.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [user.id, refreshToken]);

    return refreshToken;
};


// Eliminar todos los refresh tokens de un usuario (al cerrar sesión)
const deleteUserTokens = async (userId) => {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};



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

        // Generar nuevo access token
        const newAccessToken = generateAccessToken({ id: decoded.id });

        return newAccessToken;

    } catch (error) {
        throw new Error('Refresh token expirado o inválido');
    }

};


module.exports = {

    generateAccessToken,
    generateRefreshToken,
    deleteUserTokens,
    refreshAccessToken
    
};