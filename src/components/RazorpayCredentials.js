'use client';

import { useState, useEffect } from 'react';
import NotificationModal from './NotificationModal';
import ConfirmationModal from './ConfirmationModal';

export default function RazorpayCredentials() {
  const [credentials, setCredentials] = useState({
    keyId: '',
    keySecret: '',
    environment: 'test'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [confirmationData, setConfirmationData] = useState({});

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/razorpay/credentials');
      const data = await response.json();
      
      if (data.success) {
        setCredentials({
          keyId: data.data.keyId || '',
          keySecret: '', // Don't show existing secret for security
          environment: data.data.environment || 'test'
        });
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch Razorpay credentials'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!credentials.keyId.trim() || !credentials.keySecret.trim()) {
      setNotificationData({
        type: 'error',
        title: 'Validation Error',
        message: 'Both Key ID and Key Secret are required'
      });
      setShowNotification(true);
      return;
    }

    setConfirmationData({
      title: 'Update Razorpay Credentials',
      message: 'Are you sure you want to update the Razorpay credentials? This will affect all future payments.',
      onConfirm: performSave
    });
    setShowConfirmation(true);
  };

  const performSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/razorpay/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success) {
        setNotificationData({
          type: 'success',
          title: 'Success',
          message: 'Razorpay credentials updated successfully!'
        });
        setShowNotification(true);
        // Clear the secret field for security
        setCredentials(prev => ({ ...prev, keySecret: '' }));
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to update credentials'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to update Razorpay credentials'
      });
      setShowNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!credentials.keyId.trim() || !credentials.keySecret.trim()) {
      setNotificationData({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter both Key ID and Key Secret to test the connection'
      });
      setShowNotification(true);
      return;
    }

    try {
      setSaving(true);
      // Test by creating a small order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1, // 1 rupee test
          currency: 'INR'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNotificationData({
          type: 'success',
          title: 'Connection Test Successful',
          message: 'Razorpay credentials are working correctly!'
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'Connection Test Failed',
          message: data.error || 'Invalid credentials or connection issue'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setNotificationData({
        type: 'error',
        title: 'Connection Test Failed',
        message: 'Failed to test Razorpay connection'
      });
      setShowNotification(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Razorpay Credentials</h2>
        <p className="text-gray-600">
          Manage your Razorpay payment gateway credentials. Update these to use your own Razorpay account.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environment
          </label>
          <select
            value={credentials.environment}
            onChange={(e) => setCredentials(prev => ({ ...prev, environment: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-lg"
          >
            <option value="test">Test Environment</option>
            <option value="live">Live Environment</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {credentials.environment === 'test' 
              ? 'Use test credentials for development and testing' 
              : 'Use live credentials for production payments'
            }
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Razorpay Key ID
          </label>
          <input
            type="text"
            value={credentials.keyId}
            onChange={(e) => setCredentials(prev => ({ ...prev, keyId: e.target.value }))}
            placeholder="rzp_test_xxxxxxxxxxxxx or rzp_live_xxxxxxxxxxxxx"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Razorpay Key Secret
          </label>
          <input
            type="password"
            value={credentials.keySecret}
            onChange={(e) => setCredentials(prev => ({ ...prev, keySecret: e.target.value }))}
            placeholder="Enter your Razorpay Key Secret"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your Razorpay Key Secret (keep this secure and never share it)
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white text-lg`}
          >
            {saving ? 'Saving...' : 'Save Credentials'}
          </button>
          
          <button
            onClick={handleTestConnection}
            disabled={saving}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white text-lg`}
          >
            {saving ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your Key Secret is encrypted and stored securely</li>
                  <li>Never share your credentials with anyone</li>
                  <li>Use test credentials for development</li>
                  <li>Switch to live credentials only for production</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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

      {/* Confirmation Modal */}
      {showConfirmation && (
        <ConfirmationModal
          title={confirmationData.title}
          message={confirmationData.message}
          onConfirm={confirmationData.onConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}
