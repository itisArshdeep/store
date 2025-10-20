'use client';

import { useState } from 'react';
import WeightPriceConverter from './WeightPriceConverter';

export default function PakodaModal({ 
  item, 
  isOpen, 
  onClose, 
  onAddToCart 
}) {
  const [quantity, setQuantity] = useState(1);
  const [converterValues, setConverterValues] = useState({
    weight: 0,
    price: 0,
    mode: 'weight'
  });

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleConverterChange = (values) => {
    setConverterValues(values);
  };

  const handleAddToCart = () => {
    if (converterValues.weight <= 0 && converterValues.price <= 0) {
      alert('Please enter weight or price');
      return;
    }

    const cartItem = {
      id: item._id,
      name: item.name,
      basePrice: item.basePrice,
      quantity: 1, // Always 1 for weight-based items
      weight: converterValues.weight,
      price: converterValues.price,
      mode: converterValues.mode,
      totalPrice: converterValues.price,
      hasWeightPricing: true,
      cartId: Date.now() + Math.random() // Unique ID for each weight-based entry
    };

    onAddToCart(cartItem);
    
    // Reset and close
    setQuantity(1);
    setConverterValues({ weight: 0, price: 0, mode: 'weight' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Item Info */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              ₹{item.basePrice}/kg
            </div>
            <p className="text-sm text-gray-500">
              {item.description}
            </p>
          </div>

          {/* Weight/Price Converter */}
          <WeightPriceConverter
            basePricePerKg={item.basePrice}
            onValueChange={handleConverterChange}
            initialMode={converterValues.mode}
            initialWeight={converterValues.weight}
            initialPrice={converterValues.price}
          />

          {/* Quantity Selector */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="mx-4 text-lg font-medium text-gray-800 min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              +
            </button>
          </div>

          {/* Total Price Display */}
          <div className="text-center">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-xl font-bold text-blue-600">
              ₹{(converterValues.price * quantity).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleAddToCart}
            disabled={converterValues.weight <= 0 && converterValues.price <= 0}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              (converterValues.weight > 0 || converterValues.price > 0)
                ? 'bg-blue-500 hover:bg-blue-600 shadow-sm hover:shadow-md'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
