import cron, { type ScheduledTask } from 'node-cron';
import { sessionStore } from '../services/sessionStore.js';

let expiryTask: ScheduledTask | null = null;

export function startExpiryJob(): void {
  if (expiryTask) return;

  // Run every 30 minutes
  expiryTask = cron.schedule('*/30 * * * *', async () => {
    try {
      const expiredCount = await sessionStore.expireOldSessions();
      if (expiredCount > 0) {
        console.log(`[ExpiryJob] Expired ${expiredCount} past-due interview session(s).`);
      }
    } catch (err: any) {
      console.error('[ExpiryJob] Error running expiry job:', err.message);
    }
  });

  console.log('[ExpiryJob] Scheduled interview session expiry job (every 30m)');
}

export function stopExpiryJob(): void {
  if (expiryTask) {
    expiryTask.stop();
    expiryTask = null;
  }
}
