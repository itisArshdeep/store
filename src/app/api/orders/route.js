import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Order from '../../../models/Order';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    await connectDB();

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      items, 
      totalAmount, 
      customerInfo, 
      paymentId 
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid total amount is required' },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      return NextResponse.json(
        { success: false, error: 'Customer information is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate order ID and pickup OTP
    const orderCount = await Order.countDocuments();
    const orderId = `SDH${(orderCount + 1).toString().padStart(4, '0')}`;
    const pickupOTP = Math.floor(100000 + Math.random() * 900000).toString();

    console.log('Creating order with orderId:', orderId);

    // Create order
    const order = new Order({
      orderId,
      items,
      totalAmount: parseFloat(totalAmount),
      customerInfo,
      paymentId: paymentId || null,
      pickupOTP,
      status: 'pending'
    });

    await order.save();
    console.log('Order saved with ID:', order._id, 'orderId:', order.orderId);

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
