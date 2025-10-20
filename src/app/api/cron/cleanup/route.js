import { NextResponse } from 'next/server';
import { cleanupOldOrders } from '../../../../lib/cleanup';

export async function GET(request) {
  try {
    // Verify the request is from a legitimate source (optional)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deletedCount = await cleanupOldOrders();

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
