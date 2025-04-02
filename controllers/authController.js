const { errorController } = require('./errorController');
const { generateAccessToken, generateRefreshToken, deleteUserRefreshTokens, refreshAccessToken} = require('../controllers/tokenController');
const { isPasswordValid } = require('../utils/validators');
const { getUserByEmail } = require('../queries/userQueries');


//Si el usuario existe y la contraseña es correcta, devuelve los access y refresh tokens 
const loginUser = async (email,password, next) =>{

    try{

        const user = await getUserByEmail(email);

        if (!user) { return errorController('Usuario no encontrado', 401, next); }

        if (!password || password.trim() === "") { return errorController('Contraseña no proporcionada', 401, next); }

        const validPassword = await isPasswordValid(password,user.password);

        if (!validPassword) { return errorController('Contraseña incorrecta', 401, next); }

        //Generar token de acceso y de refresco para el usuario
        const accessToken = await generateAccessToken(user);
        const refreshToken= await generateRefreshToken(user);

        return { accessToken, refreshToken }

    } catch(error) {

        //console.error('Login error:', error);
        return errorController('Error en el login', 500, next);

    }

}



const logoutUser = async (userId,next) => {

    try {

        await deleteUserRefreshTokens(userId,next);
        //console.log("cerrando sesión correctamente");
        return { message: 'Sesión cerrada correctamente' };

    } catch (error) { return errorController('Error al cerrar sesión', 500, next); }
    
}


//Recibe un refreshToken y genera un nuevo accessToken
const newAccessToken = async (refreshToken,next) => {

    try {

        return await refreshAccessToken(refreshToken,next);

    } catch (error) {  return errorController('No se pudo refrescar el token: ' + error.message, 403, next); }


}


module.exports = {
    loginUser,
    logoutUser,
    newAccessToken
};