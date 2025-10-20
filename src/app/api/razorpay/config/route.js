import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import RazorpayCredentials from '../../../../models/RazorpayCredentials';

export async function GET() {
  try {
    await connectDB();
    
    let credentials = await RazorpayCredentials.findOne();
    
    // If no credentials exist, use environment variables
    if (!credentials) {
      return NextResponse.json({
        success: true,
        data: {
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
          environment: 'test'
        }
      });
    }

    // Only return the key ID for frontend use
    return NextResponse.json({
      success: true,
      data: {
        keyId: credentials.keyId,
        environment: credentials.environment
      }
    });
  } catch (error) {
    console.error('Error fetching Razorpay config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}
