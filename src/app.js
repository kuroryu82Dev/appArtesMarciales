import { express } from "express";
import { apiRouter } from "./routes/index.routes.js";
import { notFoundMiddleware } from './middlewares/not-found.middleware.js'
import errorMiddleware from './middlewares/error.middleware.js'

const app = express();

app.use(express.json());

app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;