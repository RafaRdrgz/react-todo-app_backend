const express = require('express');
const { errorController } = require('../controllers/errorController');
const { loginUser, logoutUser, newAccessToken, googleUser } = require('../controllers/authController');
const {  authenticateJWT, authenticateRefreshJWT, authenticateGoogleJWT } = require('../middleware/authMiddleware');


const AuthRouter = express.Router(); // Inicializamos el router


//Recibo la petición login del frontend con el usuario y la contraseña a validar y devuelvo los tokens
AuthRouter.post('/login', async (req, res, next) => {

    const { email, password } = req.body;

    try {

        const { accessToken, refreshToken } = await loginUser(email,password,next);

        //Retornamos al frontend ambos tokens
        return res.json({ accessToken, refreshToken });

    } catch (error) {

        console.error('Login error:', error);
        return errorController('Error en el servidor', 500, next);

    }
});


//Continuar con google

AuthRouter.post('/continuewith-google',authenticateGoogleJWT, async (req, res, next) =>{


    try {

        const {name, email, google_id } = req.user;
    
        // Buscar si ya existe el usuario


        const { accessToken, refreshToken } = await googleUser(name, email, google_id, next);

        //Retornamos al frontend ambos tokens
        return res.json({ accessToken, refreshToken });

    } catch (error) {
        console.error('Google Login error:', error);
        return errorController('Google login error', 500, next);
    }

});


//Logout 
AuthRouter.post('/logout', authenticateJWT , async (req, res, next) => {

    const userId = req.user.id; // Tomar el ID del usuario desde el req.user de authenticateJWT

    try {

        const { message } = await logoutUser(userId,next);
        //console.log("cerrando sesión correctamente");
        res.json({ message });

    } catch (error) { return errorController('Error al cerrar sesión', 500, next); }

});





//Refrescar Access Token
AuthRouter.post('/refresh-token', authenticateRefreshJWT , async (req, res, next) => {
    try {

        const { refreshToken } = req.body;
        
        const accessToken = await newAccessToken(refreshToken, next);

        return res.json({ accessToken });

    } catch (error) {

        return errorController('No se pudo refrescar el token: ' + error.message, 403, next);

    }
});




module.exports = AuthRouter;