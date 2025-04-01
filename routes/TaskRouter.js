const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Importamos el pool para la base de datos
const { JWT_TOKEN } = require('../config/config');


const TaskRouter = express.Router(); // Inicializamos el router



// Middleware para autenticar el usuario con JWT
const authenticateUser = (req, res, next) => {

  const token = req.header('Authorization'); // Leer el token del header

  if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {

      const decoded = jwt.verify(token, JWT_SECRET); // Verificamos el token
      req.user = decoded; // Guardamos la info del usuario en req.user
      next(); // Pasamos al siguiente middleware o controlador

  } catch (error) {

      res.status(403).json({ message: 'Token inválido' });
  }
};






// Obtener todas las tareas
TaskRouter.get('/tasks', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tasks');
      res.json(result.rows); // Retornamos todas las tareas
    } catch (error) {
      console.error('Error obteniendo tareas:', error);
      res.status(500).json({ message: 'Error obteniendo tareas' });
    }
});

// Crear una nueva tarea
TaskRouter.post('/tasks', async (req, res) => {
    const { userId, title, description } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
        [userId, title, description]
      );
      res.json(result.rows[0]); // Retornamos la tarea creada
    } catch (error) {
      console.error('Error creando tarea:', error);
      res.status(500).json({ message: 'Error creando tarea' });
    }
  });



// Eliminar una tarea
TaskRouter.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
      }
  
      res.json({ message: 'Tarea eliminada' });
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      res.status(500).json({ message: 'Error eliminando tarea' });
    }
});


// Actualizar una tarea
TaskRouter.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
        [title, description, completed, id]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
      }
  
      res.json(result.rows[0]); // Retornamos la tarea actualizada
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      res.status(500).json({ message: 'Error actualizando tarea' });
    }
  });


  module.exports = TaskRouter;