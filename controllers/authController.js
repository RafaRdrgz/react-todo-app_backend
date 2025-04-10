const { errorController } = require('./errorController');
const { generateAccessToken, generateRefreshToken, deleteUserRefreshTokens, refreshAccessToken} = require('../controllers/tokenController');
const { isPasswordValid } = require('../utils/validators');
const { getUserByEmail, createUser } = require('../queries/userQueries');


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


const googleUser = async (name, email, google_id, next) =>{

    try {

        let user = await getUserByEmail(email);

        // Si el usuario no existe, lo creamos
        if (!user) {
        user = await createUser({
            name: name,  // O usar `name` si se pasa también desde req.user
            email: email,
            password: null,          // No hay contraseña porque es Google login
            google_id: google_id,
            auth_provider: 'google'
        });
        } else {

            // Si existe pero no tiene google_id asociado, error o actualización (según tu lógica)
            if (!user.google_id) {
                return errorController('El correo ya está registrado sin Google', 400, next);
            }

            // Si el google_id no coincide, podría ser un intento malicioso
            if (user.google_id !== google_id) {
                return errorController('ID de Google no coincide con el usuario registrado', 403, next);
            }

        }

        //Generar token de acceso y de refresco para el usuario
        const accessToken = await generateAccessToken(user);
        const refreshToken= await generateRefreshToken(user);

        return { accessToken, refreshToken }

    } catch (error) { return errorController('Error en google login', 500, next); }

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
    googleUser,
    logoutUser,
    newAccessToken
};