'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import ModernMenuItem from '../components/ModernMenuItem';
import PakodaModal from '../components/PakodaModal';
import Cart from '../components/Cart';
import CheckoutForm from '../components/CheckoutForm';
import OTPModal from '../components/OTPModal';
import RazorpayPayment from '../components/RazorpayPayment';

// Menu items will be fetched from API

export default function Home() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPakodaModalOpen, setIsPakodaModalOpen] = useState(false);
  const [selectedPakodaItem, setSelectedPakodaItem] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isOTPSending, setIsOTPSending] = useState(false);
  const [isOTPVerifying, setIsOTPVerifying] = useState(false);
  const [isOrderCreating, setIsOrderCreating] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      // For weight-based items, each addition should be treated as a separate cart entry
      if (item.hasWeightPricing) {
        const newItem = { ...item, cartId: Date.now() + Math.random() };
        return [...prev, newItem];
      }
      
      // For regular items, find existing item and update quantity
      const existingItemIndex = prev.findIndex(cartItem => 
        cartItem.id === item.id && !cartItem.hasWeightPricing
      );

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...prev];
        const newQuantity = updatedItems[existingItemIndex].quantity + 1;
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          totalPrice: updatedItems[existingItemIndex].basePrice * newQuantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        const newItem = { ...item, quantity: 1, totalPrice: item.basePrice };
        return [...prev, newItem];
      }
    });
  };

  const handleOpenPakodaModal = (item) => {
    setSelectedPakodaItem(item);
    setIsPakodaModalOpen(true);
  };

  const handleClosePakodaModal = () => {
    setIsPakodaModalOpen(false);
    setSelectedPakodaItem(null);
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => (item.cartId || item.id) !== itemId));
  };

  const handleUpdateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev =>
        prev.map(item => {
          if (item.id === itemId) {
            const updatedItem = { ...item, quantity: newQuantity, totalPrice: item.basePrice * newQuantity };
            return updatedItem;
          }
          return item;
        })
      );
    }
  };

  const handleRemoveWeightBasedItem = (itemId) => {
    setCartItems(prev => {
      // For weight-based items, remove the last added item of this type
      const weightBasedItems = prev.filter(item => item.id === itemId && item.hasWeightPricing);
      if (weightBasedItems.length > 0) {
        const lastItem = weightBasedItems[weightBasedItems.length - 1];
        return prev.filter(item => item.cartId !== lastItem.cartId);
      }
      return prev;
    });
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleProceedToPayment = async (formData) => {
    setIsOTPSending(true);
    setPaymentError('');
    
    try {
      // Send OTP
      const otpResponse = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const otpData = await otpResponse.json();
      
      if (!otpData.success) {
        setPaymentError(`Failed to send OTP: ${otpData.error}`);
        return;
      }

      // Store customer data and open OTP modal
      setCustomerData(formData);
      setIsCheckoutOpen(false);
      setIsOTPModalOpen(true);
      setPaymentError('');
    } catch (error) {
      console.error('OTP send error:', error);
      setPaymentError('Failed to send OTP. Please try again.');
    } finally {
      setIsOTPSending(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setIsOTPVerifying(true);
    setPaymentError('');
    
    try {
      // Verify OTP
      const verifyResponse = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: customerData.email, otp }),
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        throw new Error(verifyData.error);
      }

      // OTP verified successfully - proceed to payment
      setIsOTPModalOpen(false);
      setIsPaymentProcessing(true);
      setPaymentError('');
    } catch (error) {
      throw new Error(error.message || 'OTP verification failed');
    } finally {
      setIsOTPVerifying(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    console.log('Payment success response:', paymentResponse);
    setIsOrderCreating(true);
    
    try {
      // Create order after successful payment
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: totalAmount,
          customerInfo: customerData,
          paymentId: paymentResponse.razorpay_payment_id
        }),
      });

      console.log('Order creation response status:', orderResponse.status);
      const orderData = await orderResponse.json();
      console.log('Order creation response data:', orderData);
      
      if (orderData.success && orderData.data && orderData.data._id) {
        // Clear cart and state
        setCartItems([]);
        setCustomerData(null);
        setIsPaymentProcessing(false);
        setPaymentError('');
        
        // Redirect to success page with order ID
        const orderId = orderData.data._id;
        const successUrl = `/success?orderId=${encodeURIComponent(orderId)}`;
        console.log('Redirecting to:', successUrl);
        router.push(successUrl);
      } else {
        setPaymentError(`Failed to create order: ${orderData.error}`);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setPaymentError('Payment successful but failed to create order. Please contact support.');
    } finally {
      setIsOrderCreating(false);
    }
  };

  const handlePaymentError = (error) => {
    setIsPaymentProcessing(false);
    setPaymentError('');
    
    // Redirect to failure page for payment errors
    if (error.includes('cancelled') || error.includes('failed')) {
      router.push('/failure');
    } else {
      setPaymentError(error);
    }
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Santa Di Hatti
          </h2>
          <p className="text-gray-600 text-lg">
            Fresh, delicious food made with love
          </p>
        </div>

        {/* Recommended Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Recommended ({menuItems.length})</h3>
          <div className="flex items-center text-gray-500">
            <span className="text-sm">View All</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <ModernMenuItem
                key={item._id}
                item={item}
                onAddToCart={handleAddToCart}
                onOpenPakodaModal={handleOpenPakodaModal}
                cartItems={cartItems}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                onOpenCart={() => setIsCartOpen(true)}
              />
            ))}
        </div>

        {/* Cart Footer - Fixed at bottom */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">
                Total: ₹{totalAmount.toFixed(2)}
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-medium transition-colors duration-200"
              >
                <span className="text-xl">🛒</span>
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🍽️ How to Order
          </h3>
          <div className="space-y-2 text-blue-700">
            <p>• <strong>Samosa & Jalebi:</strong> Order by quantity (each piece)</p>
            <p>• <strong>Pakoda Items:</strong> Click ADD to choose by weight (grams) or price (₹)</p>
            <p>• <strong>Dynamic Pricing:</strong> System automatically converts between weight and price</p>
            <p>• <strong>Fresh Made:</strong> All items are prepared fresh upon order</p>
          </div>
        </div>
      </main>

      {/* Cart Modal */}
      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutForm
        items={cartItems}
        totalAmount={totalAmount}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onProceedToPayment={handleProceedToPayment}
        isLoading={isOTPSending}
      />

      {/* Pakoda Modal */}
      {selectedPakodaItem && (
        <PakodaModal
          item={selectedPakodaItem}
          isOpen={isPakodaModalOpen}
          onClose={handleClosePakodaModal}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* OTP Modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => {
          setIsOTPModalOpen(false);
          setCustomerData(null);
        }}
        email={customerData?.email || ''}
        onVerifyOTP={handleVerifyOTP}
        isLoading={isOTPVerifying}
      />

      {/* Razorpay Payment */}
      {isPaymentProcessing && customerData && (
        <RazorpayPayment
          key={`razorpay-${customerData.email}-${totalAmount}`}
          amount={totalAmount}
          customerInfo={customerData}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          isLoading={isOrderCreating}
        />
      )}

      {/* Payment Error Display */}
      {paymentError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {paymentError}
          <button
            onClick={() => setPaymentError('')}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
