import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

export async function POST(request) {
  try {
    const { orderId, otp, forceComplete, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the order
    const order = await Order.findOne({ 
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ]
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is already completed
    if (order.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Order is already completed' },
        { status: 400 }
      );
    }

    // Check if order is in a valid state for completion
    if (order.status !== 'pending' && order.status !== 'ready') {
      return NextResponse.json(
        { success: false, error: 'Order is not in a valid state for completion' },
        { status: 400 }
      );
    }

    // Verify OTP unless force complete
    if (!forceComplete) {
      if (!otp) {
        return NextResponse.json(
          { success: false, error: 'OTP is required' },
          { status: 400 }
        );
      }

      if (order.pickupOTP !== otp) {
        return NextResponse.json(
          { success: false, error: 'Invalid pickup OTP' },
          { status: 400 }
        );
      }
    } else {
      // Force complete - no reason required
      console.log('Force completing order without reason');
    }

    // Update order status
    order.status = 'completed';
    order.completedAt = new Date();
    if (forceComplete) {
      order.forceCompleteReason = 'Force completed without reason';
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order completed successfully',
      data: order
    });
  } catch (error) {
    console.error('Order completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete order' },
      { status: 500 }
    );
  }
}
