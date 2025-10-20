import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

export async function POST(request) {
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

    console.log(`Cleaned up ${result.deletedCount} orders older than 48 hours`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} orders older than 48 hours`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Order cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup orders' },
      { status: 500 }
    );
  }
}
