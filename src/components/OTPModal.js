'use client';

import { useState } from 'react';

export default function OTPModal({ 
  isOpen, 
  onClose, 
  email, 
  onVerifyOTP,
  isLoading = false
}) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setError('');

    try {
      await onVerifyOTP(otp);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResendOTP = async () => {
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.success) {
        setError(`Failed to resend OTP: ${data.error}`);
      } else {
        setError('');
        setOtp('');
        // Show success message briefly
        setTimeout(() => setError(''), 2000);
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Verify OTP</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Check your email
            </h3>
            <p className="text-gray-600">
              We've sent a 6-digit OTP to
            </p>
            <p className="font-medium text-blue-600">
              {email}
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError('');
                }}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200"
                maxLength="6"
                autoComplete="one-time-code"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                isLoading || otp.length !== 6
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the OTP?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isVerifying}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200 disabled:text-gray-400"
            >
              Resend OTP
            </button>
          </div>

          {/* Timer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              OTP expires in 5 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
