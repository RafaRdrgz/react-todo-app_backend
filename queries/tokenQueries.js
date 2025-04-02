const pool = require('../config/db'); // Importamos el pool para la base de datos


//Comprobar que un refresh token existe
const refreshTokenExtists = async (refreshToken) => {
    const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
    return result.rows.length > 0;
};
  
// Eliminar un refresh token específico
const removeRefreshToken = async (token) => {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

// Eliminar todos los refresh tokens de un usuario
const removeUserRefreshTokens = async (userId) => {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

// Eliminar refresh tokens expirados
const removeUserExpiredRefreshTokens = async (userId) => {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()', [userId]);
};

// Obtener un refresh token específico desde la base de datos
const getRefreshToken = async (refreshToken) => {
    const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
    return result.rows.length > 0 ? result.rows[0] : null;
};


// Guardar un nuevo refresh token con la fecha de expiración (7 dias)
const saveRefreshToken = async (userId, refreshToken) => {
    await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
        [userId, refreshToken]
    );
};


module.exports = {

    refreshTokenExtists,
    removeUserRefreshTokens,
    removeRefreshToken,
    removeUserExpiredRefreshTokens,
    getRefreshToken,
    saveRefreshToken

};