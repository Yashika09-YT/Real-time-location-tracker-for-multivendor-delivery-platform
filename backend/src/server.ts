import http from 'http';
import app from './app';
import connectDB from './config/db';
import { PORT } from './config';
import { initSocketIO } from './services/socketManager';

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  
  initSocketIO(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Socket.IO listening on port ${PORT}`);
  });
};

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});