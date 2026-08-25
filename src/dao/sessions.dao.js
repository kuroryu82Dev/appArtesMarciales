class SessionsDao {
    async getStatus() {
        return {
            message: 'Estructura de sesiones disponible',
        };
    }
}

export default new SessionsDao();