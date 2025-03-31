const { Pool } = require('pg'); // Importamos Pool desde pg para manejar la conexión a la DB


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

// Exportamos el pool para que se pueda usar en otros archivos
module.exports = pool;