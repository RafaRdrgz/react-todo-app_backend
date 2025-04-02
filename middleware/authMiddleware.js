const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/config'); // Clave secreta JWT
const { deleteRefreshToken , getRefreshToken } = require('../controllers/tokenController');
const { errorController } = require ('../controllers/errorController');
const { getRefreshToken } = require('../queries/tokenQueries');


// Función reutilizable para comprobar si el refresh token existe en la base de datos
const checkRefreshTokenInDb = async (refreshToken) => {
  const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
  return result.rows.length > 0;
};

// Middleware para verificar el token JWT
const authenticateJWT = (req, res, next) => {

  const authHeader = req.headers.authorization;
  //console.log('Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) { return errorController('Fallo en headers, formato incorrecto.', 403, next); } //Manejo de headers erróneos o inexistentes

  const accessToken = authHeader.split(' ')[1]; // Obtener token desde el header

  if (!accessToken) { return errorController('No access token provided', 401, next); } // Manejo de tokens erróneos o inexistentes

  // Verificar el token usando la clave secreta
  jwt.verify(accessToken, JWT_SECRET, (err, user) => {

    if (err) {

      const errorMessage = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';

      return errorController(errorMessage, 401, next);

    }

    req.user = user; // Si es válido, se agrega el usuario al req
    next(); // Llamamos a next() para pasar al siguiente middleware o controlador
  });
};


// Middleware para validar Refresh Token
const authenticateRefreshJWT = async (req, res, next) => {
  
    const { refreshToken } = req.body;

    if (!refreshToken) { return errorController('No refresh token provided', 401, next); }

    try {

        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        const isTokenValid = await getRefreshToken(refreshToken);

        if (!isTokenValid) {

            return errorController('Refresh token inválido', 403, next);

        }

        //Impide reutilización de tokens pero mantiene la sesión en otros dispositivos
        await deleteRefreshToken(refreshToken);

        req.user = decoded;
        next();

    } catch (error) {

      let { message, status } = { message: 'Error al procesar el refresh token.', status: 500 }; // Valor predeterminado
      
      switch (error.name) {

        case 'TokenExpiredError':
            message = 'El refresh token ha expirado.';
            status = 403;
            break;
        case 'JsonWebTokenError':
            message = 'Refresh token inválido.';
            status = 403;
            break;
        // Se pueden agregar más casos según los tipos de error que se quieran gestionar
        default:
            message = 'Error desconocido al procesar el refresh token.';
            status = 500;
            break;
    }

    return errorController(message, status, next);

    }
};

module.exports = { authenticateJWT , authenticateRefreshJWT };
