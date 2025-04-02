const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/config'); // Clave secreta JWT
const { deleteRefreshToken } = require('../controllers/tokenController');


// Middleware para verificar el token JWT
const authenticateJWT = (req, res, next) => {

  const authHeader = req.headers.authorization;
  //console.log('Authorization Header:', authHeader);


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Fallo en headers' });
  }


  const token = authHeader.split(' ')[1]; // Obtener token desde el header

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verificar el token usando la clave secreta
  jwt.verify(token, JWT_SECRET, (err, user) => {

    if (err) {
      const errorMessage = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
      return res.status(401).json({ message: errorMessage });
    }

    req.user = user; // Si es válido, se agrega el usuario al req
    next(); // Llamamos a next() para pasar al siguiente middleware o controlador
  });
};


// Middleware para validar Refresh Token
const authenticateRefreshJWT = async (req, res, next) => {
  
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);



        const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'Refresh token inválido' });
        }

        //Impide reutilización de tokens pero mantiene la sesión en otros dispositivos
        await deleteRefreshToken(refreshToken);


        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Refresh token expirado o inválido' });
    }
};

module.exports = { authenticateJWT , authenticateRefreshJWT };
