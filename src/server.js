import app from "./app.js";
import env from "./config/env.config.js";
import connectDatabase from "./config/database.config.js";

const startServer = async () => {
    try{
        await connectDatabase();
        
        app.listen(env.port, () =>{
            console.log(`Servidor activo en el puerto ${env.port} en modo ${env.nodeEnv}`);
        })
    }
    catch(error){
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
