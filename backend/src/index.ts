import { createApp } from './app.js';
import { env } from './config/env.js';
import { startExpiryJob } from './jobs/expiryJob.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 HireNova Backend listening on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`📡 Health Check: http://localhost:${env.PORT}/api/health`);
  startExpiryJob();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
