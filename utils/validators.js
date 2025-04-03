const bcrypt = require('bcryptjs'); // Importamos bcryptjs para las contraseñas cifradas

// Validar formato del correo electrónico
const validateEmail = (email) => {

    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    return regex.test(email);  // Retorna true si el correo tiene el formato correcto
};

//Compara la contraseña proporcionada por el usuario con la obtenida de la base de datos (encriptada)
const isPasswordValid= async (password, userPassword) => {return await bcrypt.compare(password, userPassword);}


module.exports = { validateEmail, isPasswordValid };