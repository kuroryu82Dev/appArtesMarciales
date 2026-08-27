import  mongoose  from "mongoose";
import env from "./env.config.js";

export const connectDatabase = async () =>{
    try {
        await mongoose.connect(env.mongoUrl)
        console.log('Conexión a la base de datos establecida');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
}