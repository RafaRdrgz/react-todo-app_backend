

const errorController = (message, status, next) => {

    const error = new Error(message);
    
    error.status = status;

    return next(error);

}


module.exports = {  errorController };