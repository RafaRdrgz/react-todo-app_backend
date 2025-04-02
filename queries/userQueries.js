const pool = require('../config/db'); // Importamos el pool para la base de datos


// Comprobar si el usuario ya está registrado en la base de datos
const userExists = async (email) => {

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    return result.rows.length > 0;  // Retorna true si el correo ya está registrado
};


// Obtener usuario por ID
const getUserById = async (userId) => {
    
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0]; // Devuelve el usuario si existe

};

// Obtener usuario por correo electrónico
const getUserByEmail = async (email) => {

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0]; // Devuelve el usuario si existe

};


const createUser = async (name, email, picture, password, google_id, auth_provider) => {
    const result = await pool.query(
      'INSERT INTO users (name, email, picture, password, google_id, auth_provider) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, picture',
      [name, email, picture, password, google_id, auth_provider]
    );
    return result.rows[0]; // Devuelve el usuario creado
};


module.exports = {

    userExists,
    getUserById,
    getUserByEmail,
    createUser
};