const express = require('express');
const pool = require('../config/db'); // Importamos el pool para la base de datos



const TaskRouter = express.Router(); // Inicializamos el router


// Registrar un nuevo usuario
TaskRouter.post('/users/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar si el correo ya existe en la base de datos
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ message: 'Error registrando usuario' });
  }
});


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