import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '../../../../lib/mongodb';
import RazorpayCredentials from '../../../../models/RazorpayCredentials';

export async function POST(request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get credentials from database
    let credentials = await RazorpayCredentials.findOne();
    
    // Fallback to environment variables if no credentials in database
    if (!credentials) {
      credentials = {
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
        keySecret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key'
      };
    }

    // Initialize Razorpay with current credentials
    const razorpay = new Razorpay({
      key_id: credentials.keyId,
      key_secret: credentials.keySecret
    });

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
