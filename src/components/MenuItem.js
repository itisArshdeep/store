'use client';

import { useState } from 'react';
import WeightPriceConverter from './WeightPriceConverter';

export default function MenuItem({ 
  item, 
  onAddToCart,
  hasWeightPricing = false 
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
    const cartItem = {
      id: item.id,
      name: item.name,
      basePrice: item.basePrice,
      quantity,
      ...(hasWeightPricing && {
        weight: converterValues.weight,
        price: converterValues.price,
        mode: converterValues.mode,
        totalPrice: converterValues.price * quantity
      }),
      ...(!hasWeightPricing && {
        totalPrice: item.basePrice * quantity
      })
    };

    onAddToCart(cartItem);
    
    // Reset form
    setQuantity(1);
    setConverterValues({ weight: 0, price: 0, mode: 'weight' });
  };

  const canAddToCart = hasWeightPricing 
    ? (converterValues.weight > 0 || converterValues.price > 0)
    : true;

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Item Header */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
        <div className="text-sm text-gray-600">
          {hasWeightPricing ? (
            <span>₹{item.basePrice}/kg</span>
          ) : (
            <span>₹{item.basePrice} each</span>
          )}
        </div>
      </div>

      {/* Weight/Price Converter for Pakoda items */}
      {hasWeightPricing && (
        <div className="mb-4">
          <WeightPriceConverter
            basePricePerKg={item.basePrice}
            onValueChange={handleConverterChange}
            initialMode={converterValues.mode}
            initialWeight={converterValues.weight}
            initialPrice={converterValues.price}
          />
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center justify-center mb-4">
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
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600">Total</div>
        <div className="text-xl font-bold text-blue-600">
          ₹{hasWeightPricing 
            ? (converterValues.price * quantity).toFixed(2)
            : (item.basePrice * quantity).toFixed(2)
          }
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
          canAddToCart
            ? 'bg-blue-500 hover:bg-blue-600 shadow-sm hover:shadow-md'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        Add to Cart
      </button>
    </div>
  );
}
