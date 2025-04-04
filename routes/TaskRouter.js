const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware'); // Importas el middleware
const { validateTask } = require('../middleware/tasksMiddleware');
const { errorController } = require('../controllers/errorController');
const { newTask, deleteTask, updateTask, tasksByUser} = require('../controllers/taskController');


const TaskRouter = express.Router(); // Inicializamos el router


// Crear una nueva tarea
TaskRouter.post('/tasks', authenticateJWT, validateTask , async (req, res,next) => {
  
  const userId = req.user.id; // Si authenticate JWT valida el token, tendremos el userId en req.user
  const {title, description, completed } = req.body;

  try {

      const nuevaTarea = await newTask(title, description, completed, userId, next);
      res.json(nuevaTarea); // Retornamos la tarea creada

  } catch (error) {

    return errorController('Error al crear la tarea', 500, next); // Usar el errorController
  }

});


// Eliminar una tarea
TaskRouter.delete('/tasks/:id',authenticateJWT, async (req, res, next) => {

  const userId = req.user.id; // Si authenticate JWT valida el token, tendremos el userId en req.user
  const { id } = req.params; // id de la tarea

  try {

    const message = await deleteTask(id, userId);

    res.json(message);

  } catch (error) {
        console.error('Error eliminando tarea:', error);
        return errorController('Error al eliminar la tarea', 500, next);
  }

});


// Actualizar una tarea
TaskRouter.put('/tasks/:id',authenticateJWT, async (req, res, next) => {

  const userId = req.user.id; // Si authenticate JWT valida el token, tendremos el userId en req.user
  const { id } = req.params; //id de la tarea
  const { title, description, completed } = req.body;

  try {
    const updated = await updateTask(title, description, completed, id, userId, next);

    res.json(updated); // Retornamos la tarea actualizada

  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ message: 'Error actualizando tarea' });
  }
});

// Obtener todas las tareas para un usuario en concreto
TaskRouter.get('/tasks',authenticateJWT, async (req, res, next) => {
    try {

      const userId = req.user.id;

      const tasks = await tasksByUser(userId, next);

      res.json(tasks); // Retornamos todas las tareas

    } catch (error) {

      console.error('Error obteniendo tareas:', error);
      return errorController('Error al obtener tareas', 500, next);

    }
});











  module.exports = TaskRouter;