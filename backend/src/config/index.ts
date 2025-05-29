import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5001;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/delivery_tracker_dev';
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';