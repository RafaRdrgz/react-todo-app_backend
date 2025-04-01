const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/config'); //Configuración variable de entorno
const RegisterRouter = require('./routes/RegisterRouter'); //Authentication router
const AuthRouter = require('./routes/AuthRouter'); //Authentication router
const TaskRouter = require('./routes/TaskRouter'); // Importamos las rutas de tareas


//Creo la app y establezco variables de entorno
const app = express();
const port = PORT; //Variable de entorno para el puerto desde config.js

app.use(cors());
app.use(express.json()); // Para poder leer JSON en las peticiones

//Rutas con prefijo /api
// Ruta de Login de usuarios
app.use('/api/auth', AuthRouter);
// Ruta para registrar usuarios
app.use('/api', RegisterRouter);
// Usar las rutas de tareas
app.use('/api', TaskRouter);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor Backend funcionando!');
  });


app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

