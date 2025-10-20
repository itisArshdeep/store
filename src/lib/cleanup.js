import connectDB from './mongodb';
import Order from '../models/Order';

export async function cleanupOldOrders() {
  try {
    await connectDB();

    // Calculate date 48 hours ago
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // Find and delete completed orders older than 48 hours
    const result = await Order.deleteMany({
      status: 'completed',
      completedAt: { $lt: fortyEightHoursAgo }
    });

    console.log(`[CLEANUP] Deleted ${result.deletedCount} orders older than 48 hours`);
    return result.deletedCount;
  } catch (error) {
    console.error('[CLEANUP] Error cleaning up orders:', error);
    throw error;
  }
}

// Function to run cleanup every hour
export function startCleanupScheduler() {
  // Run cleanup immediately
  cleanupOldOrders();

  // Then run every hour
  setInterval(() => {
    cleanupOldOrders();
  }, 60 * 60 * 1000); // 1 hour in milliseconds

  console.log('[CLEANUP] Scheduler started - will clean up orders every hour');
}
