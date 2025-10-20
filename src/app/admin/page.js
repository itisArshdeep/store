'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '../../components/AdminLogin';
import ProductManagement from '../../components/ProductManagement';
import PaymentSettingsAccess from '../../components/PaymentSettingsAccess';
import NotificationModal from '../../components/NotificationModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { isSessionValid, clearSession, getSessionTimeLeft, formatTimeLeft } from '../../lib/session';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [currentView, setCurrentView] = useState('orders');
  const [showNotification, setShowNotification] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [confirmationData, setConfirmationData] = useState({});
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);

  useEffect(() => {
    // Check for existing session on component mount
    if (isSessionValid()) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      
      // Start session timer
      const timer = setInterval(() => {
        const timeLeft = getSessionTimeLeft();
        setSessionTimeLeft(timeLeft);
        
        if (timeLeft <= 0) {
          // Session expired
          clearSession();
          setIsAuthenticated(false);
          setNotificationData({
            type: 'warning',
            title: 'Session Expired',
            message: 'Your session has expired. Please log in again.'
          });
          setShowNotification(true);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReady = async (orderId) => {
    try {
      const response = await fetch('/api/orders/ready', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchOrders();
        setNotificationData({
          type: 'success',
          title: 'Success',
          message: 'Order marked as ready!'
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error marking order as ready:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark order as ready'
      });
      setShowNotification(true);
    }
  };

  const handleCompleteOrder = async (orderId, forceComplete = false) => {
    try {
      const response = await fetch('/api/orders/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId || selectedOrder._id || selectedOrder.orderId,
          otp: forceComplete ? null : otpInput,
          forceComplete,
          reason: null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNotificationData({
          type: 'success',
          title: 'Success',
          message: 'Order completed successfully!'
        });
        setShowNotification(true);
        setSelectedOrder(null);
        setOtpInput('');
        fetchOrders();
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to complete order'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Failed to complete order:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete order'
      });
      setShowNotification(true);
    }
  };

  const handleDeleteOrder = (orderId) => {
    setConfirmationData({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => performDeleteOrder(orderId)
    });
    setShowConfirmation(true);
  };

  const performDeleteOrder = async (orderId) => {
    try {
      const response = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNotificationData({
          type: 'success',
          title: 'Success',
          message: 'Order deleted successfully!'
        });
        setShowNotification(true);
        fetchOrders();
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to delete order'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete order'
      });
      setShowNotification(true);
    }
  };

  const handleCleanupOldOrders = () => {
    setConfirmationData({
      title: 'Cleanup Old Orders',
      message: 'This will delete all completed orders older than 48 hours. Continue?',
      confirmText: 'Cleanup',
      type: 'warning',
      onConfirm: () => performCleanupOldOrders()
    });
    setShowConfirmation(true);
  };

  const performCleanupOldOrders = async () => {
    try {
      const response = await fetch('/api/orders/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setNotificationData({
          type: 'success',
          title: 'Cleanup Complete',
          message: `Deleted ${data.deletedCount} old orders.`
        });
        setShowNotification(true);
        fetchOrders();
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to cleanup orders'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Failed to cleanup orders:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to cleanup orders'
      });
      setShowNotification(true);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'ready') return order.status === 'ready';
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getOrderAge = (completedAt) => {
    if (!completedAt) return null;
    
    const now = new Date();
    const completed = new Date(completedAt);
    const diffHours = Math.floor((now - completed) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just completed';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const isOrderOld = (completedAt) => {
    if (!completedAt) return false;
    
    const now = new Date();
    const completed = new Date(completedAt);
    const diffHours = (now - completed) / (1000 * 60 * 60);
    
    return diffHours >= 48; // 48 hours
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 md:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Admin</h1>
                <p className="text-xs text-gray-500">Santa Di Hatti</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Session Timer - Mobile */}
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                {formatTimeLeft(sessionTimeLeft)}
              </div>
              <button
                onClick={() => {
                  clearSession();
                  setIsAuthenticated(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-lg text-gray-500">Santa Di Hatti</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Session Timer */}
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                Session: {formatTimeLeft(sessionTimeLeft)}
              </div>
              <button
                onClick={handleCleanupOldOrders}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cleanup Old Orders
              </button>
              <button
                onClick={fetchOrders}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  clearSession();
                  setIsAuthenticated(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-3">
            <div className="flex space-x-2">
              <button
                onClick={handleCleanupOldOrders}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition-colors duration-200"
              >
                Cleanup
              </button>
              <button
                onClick={fetchOrders}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors duration-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Main Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4 md:mb-6">
          <button
            onClick={() => setCurrentView('orders')}
            className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-md text-sm md:text-lg font-medium transition-all duration-200 ${
              currentView === 'orders'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <span className="hidden sm:inline">Orders Management</span>
            <span className="sm:hidden">Orders</span>
          </button>
          <button
            onClick={() => setCurrentView('products')}
            className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-md text-sm md:text-lg font-medium transition-all duration-200 ${
              currentView === 'products'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <span className="hidden sm:inline">Product Management</span>
            <span className="sm:hidden">Products</span>
          </button>
          <button
            onClick={() => setCurrentView('razorpay')}
            className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-md text-sm md:text-lg font-medium transition-all duration-200 ${
              currentView === 'razorpay'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <span className="hidden sm:inline">Payment Settings</span>
            <span className="sm:hidden">Payment</span>
          </button>
        </div>

        {/* Product Management View */}
        {currentView === 'products' && <ProductManagement />}

        {/* Payment Settings View */}
        {currentView === 'razorpay' && <PaymentSettingsAccess />}

        {/* Orders Management View */}
        {currentView === 'orders' && (
          <>
            {/* Order Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4 md:mb-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'pending'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                <span className="hidden sm:inline">Pending Orders</span>
                <span className="sm:hidden">Pending</span>
                <span className="ml-1">({orders.filter(o => o.status === 'pending').length})</span>
              </button>
              <button
                onClick={() => setActiveTab('ready')}
                className={`flex-1 py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'ready'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <span className="hidden sm:inline">Ready Orders</span>
                <span className="sm:hidden">Ready</span>
                <span className="ml-1">({orders.filter(o => o.status === 'ready').length})</span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-2 px-2 md:px-4 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'completed'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-green-500'
                }`}
              >
                <span className="hidden sm:inline">Completed Orders</span>
                <span className="sm:hidden">Completed</span>
                <span className="ml-1">({orders.filter(o => o.status === 'completed').length})</span>
              </button>
            </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500">No {activeTab} orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 space-y-2 md:space-y-0">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800">
                      Order #{order.orderId || order.id}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:block md:text-right">
                    <div className="text-base md:text-lg font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className={`text-xs md:text-sm px-2 py-1 rounded-full ${
                      order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
                {order.status === 'completed' && order.completedAt && (
                  <div className="mb-3">
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      isOrderOld(order.completedAt)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getOrderAge(order.completedAt)}
                      {isOrderOld(order.completedAt) && ' (Auto-delete eligible)'}
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Customer Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {order.customerInfo.name}</p>
                    <p><strong>Email:</strong> {order.customerInfo.email}</p>
                    {order.customerInfo.carNumber && (
                      <p><strong>Car Number:</strong> {order.customerInfo.carNumber}</p>
                    )}
                    {order.customerInfo.instructions && (
                      <p><strong>Instructions:</strong> {order.customerInfo.instructions}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">
                          {item.quantity}x {item.name}
                          {item.weight && (
                            <span className="text-base font-semibold text-gray-600 ml-2">
                              ({item.mode === 'weight' ? `${item.weight}g` : `₹${item.price}`})
                            </span>
                          )}
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pickup OTP */}
                {order.status === 'pending' && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Pickup OTP</h4>
                    <div className="text-2xl font-bold text-blue-600 font-mono">
                      {order.pickupOTP}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {order.status === 'pending' && (
                  <div className="flex space-x-2 md:space-x-3">
                    <button
                      onClick={() => handleMarkAsReady(order._id || order.orderId)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 md:px-4 rounded-lg transition-colors duration-200 text-sm md:text-base"
                    >
                      <span className="hidden sm:inline">Mark as Ready</span>
                      <span className="sm:hidden">Ready</span>
                    </button>
                  </div>
                )}

                {order.status === 'ready' && (
                  <div className="flex space-x-2 md:space-x-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 md:px-4 rounded-lg transition-colors duration-200 text-sm md:text-base"
                    >
                      <span className="hidden sm:inline">Mark as Completed</span>
                      <span className="sm:hidden">Complete</span>
                    </button>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="flex space-x-2 md:space-x-3">
                    <button
                      onClick={() => handleDeleteOrder(order._id || order.orderId)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 md:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm md:text-base"
                    >
                      <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete Order</span>
                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
          </>
        )}
      </div>

      {/* Complete Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedOrder.status === 'ready' ? 'Complete Order' : 'Complete Order'} #{selectedOrder.id}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Pickup OTP
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  maxLength="6"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleCompleteOrder(selectedOrder._id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Complete with OTP
                </button>
                <button
                  onClick={() => {
                    handleCompleteOrder(selectedOrder._id, true);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Force Complete
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setOtpInput('');
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmationData.onConfirm}
        title={confirmationData.title}
        message={confirmationData.message}
        confirmText={confirmationData.confirmText}
        type={confirmationData.type}
      />
    </div>
  );
}
