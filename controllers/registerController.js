const bcrypt = require('bcryptjs');
const { errorController } = require('./errorController');
const { generateAccessToken, generateRefreshToken } = require('./tokenController');
const { userExists, createUser } = require('../queries/userQueries');
const { validateEmail } = require('../utils/validators');


const registerUser = async (name, email, password, google_id, auth_provider, next) => {

  // Validar que el correo electrónico tenga un formato correcto
  if (!email || !validateEmail(email)){ return errorController('Correo electrónico inválido', 400, next); }

  //por defecto, la hashedPassword será null por si el auth_provider no es 'local'
  let hashedPassword = null;


  // Si el proveedor de autenticación esta presente y es "local", la contraseña es obligatoria
  if (auth_provider) {

    switch (auth_provider) {

        case 'local':
          // Lógica para autenticación local (con contraseña)
          if (!password) {
            return errorController('La contraseña es requerida para autenticación local', 400, next);
          }
          //lógica para crear un usuario con contraseña
          hashedPassword = await bcrypt.hash(password, 10);
          break;
      
        case 'google':
          // Lógica para autenticación con Google (sin contraseña)
          if (!google_id) {
            return errorController('Se requiere google_id para autenticación Google', 400, next);
          }
          // Aquí puedes agregar la lógica para crear un usuario con Google (sin contraseña)
          /* DE MOMENTO NO TOCAR */
          break;
      
        default:
          // Lógica por defecto (para autenticación por otros medios, si se desea)
          return errorController('Proveedor de autenticación no soportado', 400, next);
      }


  } else {

    return errorController('No auth_provider', 400, next);
  }

  try{

    // Verificar si el usuario ya existe en la base de datos
    const exists = await userExists(email);

    if (exists) { return errorController('El correo ya está registrado', 400, next); }

    // Insertar el nuevo usuario en la base de datos
    const newUser = await createUser(name, email, hashedPassword, google_id, auth_provider);

    // Generar los tokens
    const accessToken = await generateAccessToken(newUser, next);
    const refreshToken = await generateRefreshToken(newUser, next);

    // Devolver la respuesta con el usuario y los tokens
    return { message: 'Usuario registrado con éxito', newUser, accessToken, refreshToken };


  } catch(error){
    console.error('Error registrando usuario:', error);
    return errorController('Error en el servidor', 500, next);
  }

}



module.exports = {

    registerUser

}