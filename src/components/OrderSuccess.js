'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderSuccess({ 
  orderData, 
  customerInfo, 
  items, 
  totalAmount 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [orderStatus, setOrderStatus] = useState(orderData?.status || 'pending');
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Check order status periodically
  useEffect(() => {
    if (!orderData?._id) return;

    const checkOrderStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderData._id}`);
        const data = await response.json();
        
        if (data.success && data.data.status !== orderStatus) {
          setOrderStatus(data.data.status);
          // Show notification if status changed to ready or completed
          if (data.data.status === 'ready' || data.data.status === 'completed') {
            setShowStatusNotification(true);
            // Hide notification after 5 seconds
            setTimeout(() => setShowStatusNotification(false), 5000);
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    };

    // Check immediately
    checkOrderStatus();

    // Check every 10 seconds if order is still pending or ready
    const interval = setInterval(() => {
      if (orderStatus === 'pending' || orderStatus === 'ready') {
        checkOrderStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderData?._id, orderStatus]);

  const handlePrintBill = () => {
    window.print();
  };

  const handleNewOrder = () => {
    router.push('/');
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Order Received',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: '⏳',
          description: 'Your order has been received and is being prepared'
        };
      case 'ready':
        return {
          text: 'Order Ready',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: '🍽️',
          description: 'Your order is ready for pickup! Please come to collect it.'
        };
      case 'completed':
        return {
          text: 'Order Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✅',
          description: 'Your order has been completed and is ready for pickup'
        };
      default:
        return {
          text: 'Order Received',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: '⏳',
          description: 'Your order has been received and is being prepared'
        };
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className={`text-center mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className={`w-20 h-20 ${getStatusInfo(orderStatus).bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-3xl">{getStatusInfo(orderStatus).icon}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${getStatusInfo(orderStatus).bgColor} ${getStatusInfo(orderStatus).color} font-medium mb-2`}>
            <span className="mr-2">{getStatusInfo(orderStatus).icon}</span>
            {getStatusInfo(orderStatus).text}
          </div>
          <p className="text-gray-600">{getStatusInfo(orderStatus).description}</p>
        </div>

        {/* Bill Container */}
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Bill Header */}
          <div className="bg-blue-600 text-white p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Santa Di Hatti</h2>
            <p className="text-blue-100">Delicious Food, Delivered Fresh</p>
            <div className="mt-4 text-sm text-blue-100">
              <p>📞 +91 98765 43210</p>
              <p>📍 123 Food Street, City</p>
            </div>
          </div>

          {/* Bill Content */}
          <div className="p-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold text-gray-800">{orderData.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pickup OTP</p>
                <p className="font-bold text-2xl text-blue-600">{orderData.pickupOTP}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(orderData.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Time</p>
                <p className="font-semibold text-gray-800">
                  {new Date(orderData.createdAt).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Order Status</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${getStatusInfo(orderStatus).bgColor} ${getStatusInfo(orderStatus).color} font-medium`}>
                  <span className="mr-2">{getStatusInfo(orderStatus).icon}</span>
                  {getStatusInfo(orderStatus).text}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-800">{customerInfo.name}</p>
                <p className="text-gray-600">{customerInfo.email}</p>
                {customerInfo.carNumber && (
                  <p className="text-gray-600">🚗 {customerInfo.carNumber}</p>
                )}
                {customerInfo.instructions && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Special Instructions:</span> {customerInfo.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                        {item.weight && (
                          <span className="ml-2">
                            ({item.mode === 'weight' ? `${item.weight}g` : `₹${item.price}`})
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">₹{item.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-bold text-blue-800">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-blue-600 mt-1">
                <span>Payment Status</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Paid
                </span>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800">Important Notice</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please show this pickup OTP <span className="font-bold">{orderData.pickupOTP}</span> when collecting your order. 
                    Keep this bill for your records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 mt-8 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={handlePrintBill}
            className="flex-1 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Bill
          </button>
          <button
            onClick={handleNewOrder}
            className="flex-1 py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Place New Order
          </button>
        </div>
      </div>

      {/* Status Change Notification */}
      {showStatusNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <p className="font-semibold">Order Completed!</p>
              <p className="text-sm text-green-100">Your order is ready for pickup</p>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-bill, .print-bill * {
            visibility: visible;
          }
          .print-bill {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
