'use client';

import { useState } from 'react';
import RazorpayCredentials from './RazorpayCredentials';
import NotificationModal from './NotificationModal';

export default function PaymentSettingsAccess() {
  const [isVerified, setIsVerified] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});

  const handleRequestOTP = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-settings/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setShowOTPForm(true);
        setNotificationData({
          type: 'success',
          title: 'OTP Sent',
          message: 'OTP has been sent to the authorized email address'
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to send OTP'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to send OTP'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setNotificationData({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter the OTP'
      });
      setShowNotification(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/payment-settings/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsVerified(true);
        setNotificationData({
          type: 'success',
          title: 'Access Granted',
          message: 'OTP verified successfully. You can now access payment settings.'
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'Verification Failed',
          message: data.error || 'Invalid OTP'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to verify OTP'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsVerified(false);
    setShowOTPForm(false);
    setOtp('');
  };

  if (isVerified) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Settings</h2>
            <p className="text-gray-600">
              Manage your Razorpay payment gateway credentials.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            Lock Settings
          </button>
        </div>
        <RazorpayCredentials />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Settings Access</h2>
        <p className="text-gray-600 mb-6">
          This section contains sensitive payment gateway credentials. 
          Please verify your identity to access these settings.
        </p>

        {!showOTPForm ? (
          <div>
            <button
              onClick={handleRequestOTP}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white text-lg`}
            >
              {loading ? 'Sending OTP...' : 'Request Access'}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              An OTP will be sent to the authorized email address
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-lg text-center tracking-widest"
                maxLength="6"
              />
              <p className="text-sm text-gray-500 mt-2">
                Check your email for the 6-digit OTP
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                  loading || otp.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white text-lg`}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button
                onClick={() => setShowOTPForm(false)}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Security Notice
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>OTP has been sent to the authorized email address. It will expire in 5 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotification && (
        <NotificationModal
          type={notificationData.type}
          title={notificationData.title}
          message={notificationData.message}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
}
