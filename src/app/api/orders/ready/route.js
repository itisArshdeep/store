import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Order from '../../../../models/Order';

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
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

    if (order.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Order is not in pending status' },
        { status: 400 }
      );
    }

    // Update order status to ready
    order.status = 'ready';
    order.readyAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order marked as ready',
      data: order
    });
  } catch (error) {
    console.error('Error marking order as ready:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark order as ready' },
      { status: 500 }
    );
  }
}
