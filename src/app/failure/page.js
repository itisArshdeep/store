'use client';

import { useRouter } from 'next/navigation';

export default function FailurePage() {
  const router = useRouter();

  const handleRetryPayment = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Failure Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Failure Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-8">
          We're sorry, but your payment could not be processed at this time. 
          This could be due to various reasons such as insufficient funds, 
          network issues, or payment gateway problems.
        </p>

        {/* Help Text */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <p className="font-medium text-yellow-800">What you can do:</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• Check your payment method and try again</li>
                <li>• Contact your bank if the issue persists</li>
                <li>• Try a different payment method</li>
                <li>• Contact our support team for assistance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRetryPayment}
            className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Back to Menu
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a href="tel:+919876543210" className="text-blue-500 hover:text-blue-600">
              +91 98765 43210
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
