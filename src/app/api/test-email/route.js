import { NextResponse } from 'next/server';
import { testConnection, sendOTPEmail } from '../../../lib/nodemailer';

export async function GET() {
  try {
    console.log('Testing email connection...');
    
    // Test connection
    const connectionTest = await testConnection();
    
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Gmail SMTP connection failed. Please check credentials.'
      });
    }

    // Test sending email
    const testEmail = 'deepsingh13131212@gmail.com'; // Send to yourself
    const testOTP = '123456';
    
    console.log('Sending test email...');
    const emailResult = await sendOTPEmail(testEmail, testOTP, 'verification');
    
    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: `Email sending failed: ${emailResult.error}`
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email test successful! Check your inbox.',
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
