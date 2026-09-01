const errorMiddleware = (error, req, res, next) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({
        status: 'error',
        message: 'Los datos proporcionados no son válidos',
        });
    }

    const statusCode = error.statusCode || 500;

    const message =
        statusCode === 500
        ? 'Error interno del servidor'
        : error.message;

    return res.status(statusCode).json({
        status: 'error',
        message,
    });
};

export default errorMiddleware;