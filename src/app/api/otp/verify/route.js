import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import OTP from '../../../../models/OTP';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Check if OTP is already verified
    if (otpRecord.verified) {
      return NextResponse.json(
        { success: false, error: 'OTP already used' },
        { status: 400 }
      );
    }

    // Mark OTP as verified and delete it
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
