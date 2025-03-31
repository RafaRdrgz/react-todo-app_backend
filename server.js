const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Para poder leer JSON en las peticiones

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor Backend funcionando!');
  });


app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});