

const validateTask = (req, res, next) => {

    const { title, description, completed } = req.body;

    // Verificar que el título no esté vacío
    if (!title || title.trim().length === 0) {

        const error = new Error('El título es obligatorio.');
        error.status = 400;  // Establecemos el código de estado HTTP
        return next(error);  // Pasamos el error al middleware de errores

    }

    // Validar la longitud del título (por ejemplo, mínimo 3 caracteres)
    if (title.length < 3) {

        const error = new Error('El título debe tener al menos 3 caracteres.');
        error.status = 400;
        return next(error);
    }

    // Verificar que la descripción no sea demasiado larga (opcional)
    if (description && description.length > 700) {

        const error = new Error('La descripción no debe exceder los 700 caracteres.');
        error.status = 400;
        return next(error);
    }

    // Si "completed" es proporcionado, debe ser un booleano
    if (completed !== undefined && typeof completed !== 'boolean') {

        const error = new Error('El campo "completed" debe ser un valor booleano.');
        error.status = 400;
        return next(error);

    }

    next();
}

module.exports = { validateTask };