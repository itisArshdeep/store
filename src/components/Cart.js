'use client';

import { useState } from 'react';

export default function Cart({ 
  items, 
  isOpen, 
  onClose, 
  onRemoveItem, 
  onUpdateQuantity,
  onProceedToCheckout 
}) {
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Your Cart</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Cart Items - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.cartId || `${item.id}-${index}`} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    {item.weight && (
                      <div className="text-sm text-gray-600">
                        {item.mode === 'weight' 
                          ? `${item.weight}g` 
                          : `₹${item.price}`
                        }
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.cartId || item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {!item.hasWeightPricing && (
                      <>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm"
                        >
                          +
                        </button>
                      </>
                    )}
                    {item.hasWeightPricing && (
                      <span className="text-sm text-gray-500">Weight-based item</span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    ₹{item.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Fixed at Bottom */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={onProceedToCheckout}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
