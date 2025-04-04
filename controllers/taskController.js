const { errorController } = require('./errorController');
const { createTask, removeTaskByIds, updateTaskByIds, getAllTasksByUser } = require('../queries/taskQueries');


//Crear una nueva tarea
const newTask = async (title, description, completed, userId, next) => {

    try{

        // Si completed es undefined o null, lo establecemos en false
        completed = completed ?? false;

        const task = await createTask(title, description, completed, userId);

        return task;

    } catch(error){

        console.error('Error creando tarea:', error);
        return errorController('Error al crear la tarea', 500, next); // Usar el errorController

    }

}

//Eliminar tarea por id y usuario
const deleteTask = async (id, userId, next) =>{

    try {

        const deleted = await removeTaskByIds(id, userId);

        if (!deleted) {
            return { message: 'Tarea no encontrada' };
        }
      
        return{ message: 'Tarea eliminada' };

    } catch (error) {

        console.error('Error eliminando tarea:', error);
        return errorController('Error al eliminar la tarea', 500, next);

      }

}


const updateTask = async (title, description, completed, taskId, userId, next) =>{

    try {

        const updated = await updateTaskByIds(title, description, completed, taskId, userId)

        return updated;
      } catch (error) {

        console.error('Error actualizando tarea:', error);
        return errorController('Error al actualizar la tarea', 500, next);
      }

}

//Consultar todas las tareas de un usuario
const tasksByUser = async (userId, next) =>{

    try{

        const allTasks = await getAllTasksByUser(userId);

        return allTasks;

    } catch(error){

        console.error('Error obteniendo tareas:', error);
        return errorController('Error al obtener tareas', 500, next);

    }

}



module.exports = {

    newTask,
    deleteTask,
    updateTask,
    tasksByUser

}