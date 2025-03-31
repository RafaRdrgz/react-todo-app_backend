const dotenv = require('dotenv');
const { Pool } = require('pg'); // Importamos Pool desde pg para manejar la conexión a la DB




dotenv.config(); // Cargar variables de entorno


/*
console.log("User:", process.env.DB_USER);
console.log("Host:", process.env.DB_HOST);
console.log("Database:", process.env.DB_NAME);
console.log("Password:", process.env.DB_PASSWORD);
console.log("Port:", process.env.DB_PORT); */


// Configuramos la conexión usando las variables de entorno
const pool = new Pool({
    user: process.env.DB_USER, // Usuario de la base de datos
    host: process.env.DB_HOST, // Dirección del servidor PostgreSQL
    database: process.env.DB_NAME, // Nombre de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña de la base de datos
    port: process.env.DB_PORT || 5432, // Puerto del servidor PostgreSQL (default es 5432)
  });



  
// Verificamos que la conexión esté funcionando
pool.on('connect', () => {
    console.log('Conectado a la base de datos PostgreSQL');
});


// Si ocurre un error con la conexión
pool.on('error', (err) => {
    console.error('Error de conexión a la base de datos', err);
    process.exit(1); // Salimos con un código de error si no podemos conectar
});


//Para comprobar si funciona la db
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error en la consulta:', err.stack);
    } else {
      console.log('La hora actual en la base de datos:', res.rows[0]);
    }
});


// Exportamos el pool para que se pueda usar en otros archivos
module.exports = pool;