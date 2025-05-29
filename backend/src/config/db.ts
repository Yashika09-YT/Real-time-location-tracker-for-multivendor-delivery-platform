import mongoose from 'mongoose';
import { MONGO_URI } from './index';

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://kishore:Ki1va2ni@user.v0lgs.mongodb.net/?retryWrites=true&w=majority&appName=User");
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;