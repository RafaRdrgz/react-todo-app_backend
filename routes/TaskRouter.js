const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware'); // Importas el middleware
const pool = require('../config/db'); // Importamos el pool para la base de datos


const TaskRouter = express.Router(); // Inicializamos el router


// Obtener todas las tareas para un usuario en concreto
TaskRouter.get('/tasks',authenticateJWT, async (req, res) => {
    try {

      const userId = req.user.id;
      const result = await pool.query('SELECT * FROM tasks WHERE user_id= $1', [userId]);
      res.json(result.rows); // Retornamos todas las tareas
    } catch (error) {
      console.error('Error obteniendo tareas:', error);
      res.status(500).json({ message: 'Error obteniendo tareas' });
    }
});

// Crear una nueva tarea
TaskRouter.post('/tasks',authenticateJWT, async (req, res) => {
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
TaskRouter.delete('/tasks/:id',authenticateJWT, async (req, res) => {
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
TaskRouter.put('/tasks/:id',authenticateJWT, async (req, res) => {
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