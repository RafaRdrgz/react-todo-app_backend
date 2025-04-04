const pool = require('../config/db'); // Importar el pool para interactuar con la base de datos


// Función para crear una nueva tarea
const createTask = async (title, description, completed, userId) => {

    const result = await pool.query(
      'INSERT INTO tasks (title, description, completed, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, completed, userId]
    );
    return result.rows[0]; // Devolvemos la tarea creada
};

// Función para eliminar una tarea por su ID de tarea y de usuario
const removeTaskByIds = async (taskId, userId) => {

    const removed = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [taskId, userId]
    );

    return removed.rowCount > 0; // Devolvemos true si se eliminó la tarea, false si no

};

// Función para actualizar una tarea
const updateTaskByIds = async (title, description, completed, taskId, userId) => {


    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3, WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, description, completed, taskId, userId]
    );
    return result.rows[0]; // Devolvemos la tarea actualizada

};

// Función para obtener todas las tareas de un usuario concreto
const getAllTasksByUser = async (userId) => {

    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows; // Devolvemos todas las tareas del usuario

};



module.exports = {

  createTask,
  removeTaskByIds,
  updateTaskByIds,
  getAllTasksByUser,

};