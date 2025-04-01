const dotenv = require('dotenv');


dotenv.config();


module.exports = {
    PORT: 5000,
    API_URL_PORT: "http://localhost:5000/api/login",
    JWT_SECRET: process.env.JWT_SECRET || "clave_super_secreta",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "clave_de_refresco_super_secreta",
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || 5432,
  };