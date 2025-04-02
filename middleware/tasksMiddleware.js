const { errorController } = require ('../controllers/errorController');


const validateTask = (req, res, next) => {

    const { title, description, completed } = req.body;

    // Verificar que el título no esté vacío
    if (!title || title.trim().length === 0) { return errorController('El título es obligatorio.', 400, next); }

    // Validar la longitud del título (por ejemplo, mínimo 3 caracteres)
    if (title.length < 3) { return errorController('El título debe tener al menos 3 caracteres.', 400, next); }

    // Permitir que la descripción sea opcional, pero si existe, verificar su longitud
    if (description && typeof description === 'string' && description.length > 700) {

        return errorController('La descripción no debe exceder los 700 caracteres.', 400, next);
        
    }

    // Si "completed" es proporcionado, debe ser un booleano
    if (completed !== undefined && typeof completed !== 'boolean') { return errorController('El campo "Completado" debe ser un valor booleano.', 400, next); }

    next();
}

module.exports = { validateTask };