const pool = require('../config/db'); // Importar el pool para interactuar con la base de datos

// Función para crear una nueva tarea
const createTask = async (title, description, status, userId, next) => {
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, status, userId]
    );
    return result.rows[0]; // Devolvemos la tarea creada
  } catch (error) {
    console.error('Error creando tarea:', error);
    return errorController('Error al crear la tarea', 500, next); // Usar el errorController
  }
};

// Función para obtener todas las tareas de un usuario concreto
const getAllTasksByUser = async (userId, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows; // Devolvemos todas las tareas del usuario
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    return errorController('Error al obtener tareas', 500, next);
  }
};

// Función para obtener una tarea por su ID de tarea y usuario
const getTaskById = async (taskId, userId, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );
    return result.rows[0]; // Devolvemos la tarea encontrada
  } catch (error) {
    console.error('Error obteniendo tarea por ID:', error);
    return errorController('Error al obtener la tarea', 500, next);
  }
};

// Función para actualizar una tarea
const updateTask = async (taskId, title, description, status, userId, next) => {
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, description, status, taskId, userId]
    );
    return result.rows[0]; // Devolvemos la tarea actualizada
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    return errorController('Error al actualizar la tarea', 500, next);
  }
};

// Función para eliminar una tarea por su ID de tarea y de usuario
const deleteTask = async (taskId, userId, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [taskId, userId]
    );
    return result.rowCount > 0; // Devolvemos true si se eliminó la tarea, false si no
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    return errorController('Error al eliminar la tarea', 500, next);
  }
};

module.exports = {
  createTask,
  getAllTasksByUser,
  getTaskById,
  updateTask,
  deleteTask
};