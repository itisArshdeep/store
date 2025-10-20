import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import RazorpayCredentials from '../../../../models/RazorpayCredentials';

export async function GET() {
  try {
    await connectDB();
    
    let credentials = await RazorpayCredentials.findOne();
    
    // If no credentials exist, return default test credentials
    if (!credentials) {
      credentials = {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        environment: 'test',
        isActive: true
      };
    }

    // Don't return the key secret for security
    return NextResponse.json({
      success: true,
      data: {
        keyId: credentials.keyId,
        environment: credentials.environment,
        isActive: credentials.isActive
      }
    });
  } catch (error) {
    console.error('Error fetching Razorpay credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { keyId, keySecret, environment } = await request.json();
    
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: 'Key ID and Key Secret are required' },
        { status: 400 }
      );
    }

    if (!['test', 'live'].includes(environment)) {
      return NextResponse.json(
        { success: false, error: 'Environment must be either test or live' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Update or create credentials
    const credentials = await RazorpayCredentials.findOneAndUpdate(
      {},
      {
        keyId,
        keySecret,
        environment,
        isActive: true
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Don't return the key secret for security
    return NextResponse.json({
      success: true,
      message: 'Razorpay credentials updated successfully',
      data: {
        keyId: credentials.keyId,
        environment: credentials.environment,
        isActive: credentials.isActive
      }
    });
  } catch (error) {
    console.error('Error updating Razorpay credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update credentials' },
      { status: 500 }
    );
  }
}
