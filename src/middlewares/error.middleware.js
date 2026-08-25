const errorMiddleware = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Error interno del servidor',
    });
};

export default errorMiddleware;