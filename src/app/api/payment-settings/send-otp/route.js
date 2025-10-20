import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import OTP from '../../../../models/OTP';
import { sendOTPEmail } from '../../../../lib/nodemailer';

const PAYMENT_SETTINGS_EMAIL = '0001dua@gmail.com';

export async function POST(request) {
  try {
    await connectDB();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database with 5-minute expiration
    const otpRecord = new OTP({
      email: PAYMENT_SETTINGS_EMAIL,
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      type: 'verification'
    });

    await otpRecord.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(
      PAYMENT_SETTINGS_EMAIL,
      otp,
      'Payment Settings Access'
    );

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to authorized email'
    });
  } catch (error) {
    console.error('Payment settings OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
