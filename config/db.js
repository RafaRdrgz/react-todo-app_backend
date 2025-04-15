const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD, DB_PORT } = require('./config'); // Importamos las variables de entorno necesarias
const { Pool } = require('pg'); // Importamos Pool desde pg para manejar la conexión a la DB


// Configuramos la conexión usando las variables de entorno
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
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