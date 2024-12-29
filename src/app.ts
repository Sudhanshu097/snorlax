import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestValidator } from './middleware/requestValidator';
import { routes } from './routes';
import { stream } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream }));

// Rate limiting
app.use(rateLimiter);

// Request validation
app.use(requestValidator);

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export { app };