import express from 'express';
import cors from 'cors';
import { CORS_ORIGIN } from './config';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import locationRoutes from './routes/locationRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(cors({
  origin: CORS_ORIGIN, 
  credentials: true, 
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Backend is healthy' }));
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/location', locationRoutes); 

app.use(errorHandler);

export default app;