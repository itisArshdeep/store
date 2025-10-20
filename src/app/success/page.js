'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderSuccess from '../../components/OrderSuccess';

export default function SuccessPage() {
  const [orderData, setOrderData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    // Fetch order details
    fetchOrderDetails(orderId);
  }, [searchParams]);

  const fetchOrderDetails = async (orderId) => {
    try {
      console.log('Fetching order details for ID:', orderId);
      
      // Validate orderId
      if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
        throw new Error('Invalid order ID');
      }
      
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      console.log('Order fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Order fetch response data:', data);
      
      if (data.success && data.data) {
        setOrderData(data.data);
        setCustomerInfo(data.data.customerInfo);
        setItems(data.data.items);
        setTotalAmount(data.data.totalAmount);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(`Failed to load order details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <OrderSuccess
      orderData={orderData}
      customerInfo={customerInfo}
      items={items}
      totalAmount={totalAmount}
    />
  );
}
