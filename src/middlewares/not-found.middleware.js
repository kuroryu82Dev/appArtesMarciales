const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
};

export default notFoundMiddleware;