import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import OTP from '../../../../models/OTP';

const PAYMENT_SETTINGS_EMAIL = '0001dua@gmail.com';

export async function POST(request) {
  try {
    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { success: false, error: 'OTP is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: PAYMENT_SETTINGS_EMAIL,
      otp: otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Delete the OTP record after successful verification
    await OTP.findByIdAndDelete(otpRecord._id);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Payment settings OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
