import { app } from "./app.js";
import env from "./config/env.config.js";

app.listen(env.port, () =>{
    console.log(`Servidor activo en el puerto ${env.port} en modo ${env.nodeEnv}`);
})