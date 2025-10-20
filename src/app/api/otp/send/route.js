import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import OTP from '../../../../models/OTP';
import { sendOTPEmail, testConnection } from '../../../../lib/nodemailer';

export async function POST(request) {
  try {
    const { email, type = 'verification' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Test email connection first
    console.log('Testing Gmail SMTP connection...');
    const connectionTest = await testConnection();
    if (!connectionTest) {
      return NextResponse.json(
        { success: false, error: 'Email service unavailable. Please check Gmail credentials.' },
        { status: 500 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Create new OTP record
    const otpRecord = new OTP({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    await otpRecord.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, type);
    
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        { success: false, error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    // For development, also return the OTP in response
    // Remove this in production
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this line in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
