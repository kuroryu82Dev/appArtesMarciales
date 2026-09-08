import cookieParser from 'cookie-parser';
import express from 'express';
import passport from 'passport';

import apiRouter from './routes/index.js';
import notFoundMiddleware from './middlewares/not-found.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import initializePassport from './config/passport.config.js';

const app = express();

initializePassport();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
