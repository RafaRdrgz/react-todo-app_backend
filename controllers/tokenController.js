const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/config');
const { errorController } = require('./errorController');

const {     removeUserRefreshTokens,
            removeRefreshToken,
            removeUserExpiredRefreshTokens,
            getRefreshToken,
            saveRefreshToken 
      
        } = require('../queries/tokenQueries');



// Generar Access Token (expira en 1hora)
const generateAccessToken = async (user,next) => {

    try {
    
        return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

    } catch (error) { return errorController('Error generando el access token', 500, next); }
};


// Generar Refresh Token (expira en 7 días)
const generateRefreshToken = async (user, next) => {

    try{

        const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Primero, eliminamos los tokens antiguos del usuario
        await removeUserExpiredRefreshTokens(user.id);

        // Guardar el nuevo refresh token con una fecha de expiración
        await saveRefreshToken(user.id, newRefreshToken);

        return newRefreshToken;


    } catch (error) { return errorController('Error generando el refresh token', 500, next); }

};


const existsRefreshToken = async (refreshToken,next) => {

    try {
        const tokenData = await getRefreshToken(refreshToken);

        if(tokenData != null ){ return tokenData }

        return null;
        
    } catch (error) {
        console.error('Error eliminando los refresh tokens del usuario:', error);
        return errorController('Error al eliminar los refresh tokens', 500, next);
    }

}

// Eliminar todos los refresh tokens de un usuario (al cerrar sesión o crear un nuevo refresh token)
const deleteUserRefreshTokens = async (userId, next) => {

    try {
        await removeUserRefreshTokens(userId);
    } catch (error) {
        console.error('Error eliminando los refresh tokens del usuario:', error);
        return errorController('Error al eliminar los refresh tokens', 500, next);
    }
};


// Eliminar un refresh token específico
const deleteRefreshToken = async (refreshToken, next) => {

    try {
        await removeRefreshToken(refreshToken);
    } catch (error) {
        console.error('Error eliminando el refresh token:', error);
        return errorController('Error al eliminar el refresh token', 500, next);
    }

};

//Eliminar refresh tokens expirados del usuario
const deleteExpiredRefreshTokens = async (userId, next) => {

    try {
        await removeUserExpiredRefreshTokens(userId);
    } catch (error) {
        console.error('Error eliminando los refresh tokens expirados:', error);
        return errorController('Error al eliminar los refresh tokens expirados', 500, next);
    }

}


// Validar Refresh Token y generar nuevo Access Token
const refreshAccessToken = async (refreshToken, next) => {

    if (!refreshToken) return errorController('No refresh token provided', 401, next);

    try {
        // Verificar el refresh token
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        // Buscar en la base de datos
        const tokenData = await getRefreshToken(refreshToken,next);

        // Me aseguro de que la consulta obtiene un resultado y que el token pertenece al usuario
        if (!tokenData || tokenData.user_id !== decoded.id) {
            return errorController('Refresh token inválido', 403, next);
        }

        // Generar nuevo access token
        const accessToken = await generateAccessToken({ id: decoded.id }, next);

        return accessToken;

    } catch (error) {
        
        let message = 'Error al generar el access token.';
        let status = 500;

        if (error.name === 'TokenExpiredError') {
            message = 'El refresh token ha expirado.';
            status = 403;
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Refresh token inválido.';
            status = 403;
        }
        
        return errorController(message, status, next);
    }

};


module.exports = {
    
    generateAccessToken,
    generateRefreshToken,
    existsRefreshToken,
    deleteExpiredRefreshTokens,
    deleteUserRefreshTokens,
    deleteRefreshToken,
    refreshAccessToken
    
};