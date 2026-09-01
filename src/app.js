import cookieParser from 'cookie-parser';
import express from 'express';
import apiRouter from './routes/index.js';
import notFoundMiddleware from './middlewares/not-found.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
