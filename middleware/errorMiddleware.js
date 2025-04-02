

const errorMiddleware = (err, req, res, next) => {
    console.error(err); // Aquí puedes loguear el error si lo necesitas

    // Verificamos si el error tiene un status, si no, usamos 500 (error interno del servidor)
    const statusCode = err.status || 500;


    // Responder con un JSON con el mensaje de error
    res.status(statusCode).json({
        message: err.message || 'Algo salió mal en el servidor.',
    });
}

module.exports = { errorMiddleware };