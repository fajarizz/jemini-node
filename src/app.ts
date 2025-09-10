import express, { type Request, type Response } from 'express';
import { corsMiddleware } from './config/cors.js';
import authRouter from './routes/auth.routes.js';

const app = express();

// CORS first so all subsequent routes get headers
app.use(corsMiddleware());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// Auth module
app.use('/auth', authRouter);

export default app;
