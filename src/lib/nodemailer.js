import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'deepsingh13131212@gmail.com',
    pass: 'jpxziauhknxpqwgl' // Replace with 16-character app password from Google
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection
export const testConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error);
    return false;
  }
};

export const sendOTPEmail = async (email, otp, type = 'verification') => {
  try {
    console.log('Sending OTP email to:', email, 'OTP:', otp, 'Type:', type);
    const subject = type === 'login' 
      ? 'Santa Di Hatti - Admin Login OTP' 
      : 'Santa Di Hatti - Order Verification OTP';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #007BFF, #0056b3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🍽️ Santa Di Hatti</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Fresh Food Outlet</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your OTP Code</h2>
          
          <div style="background: white; border: 2px dashed #007BFF; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Enter this code to ${type === 'login' ? 'login to admin panel' : 'verify your order'}:</p>
            <div style="font-size: 32px; font-weight: bold; color: #007BFF; letter-spacing: 5px; font-family: monospace;">${otp}</div>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            This OTP is valid for <strong>5 minutes</strong> and can only be used once.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Note:</strong> Never share this OTP with anyone. Santa Di Hatti will never ask for your OTP via phone or email.
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            If you didn't request this OTP, please ignore this email.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'deepsingh13131212@gmail.com',
      to: email,
      subject: subject,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

export default transporter;
