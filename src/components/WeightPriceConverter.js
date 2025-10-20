'use client';

import { useState, useEffect } from 'react';

export default function WeightPriceConverter({ 
  basePricePerKg, 
  onValueChange, 
  initialMode = 'weight',
  initialWeight = 0,
  initialPrice = 0 
}) {
  const [mode, setMode] = useState(initialMode);
  const [weight, setWeight] = useState(initialWeight);
  const [price, setPrice] = useState(initialPrice);

  // Conversion formulas
  const calculatePriceFromWeight = (weightInGrams) => {
    return (basePricePerKg / 1000) * weightInGrams;
  };

  const calculateWeightFromPrice = (priceValue) => {
    return (priceValue * 1000) / basePricePerKg;
  };

  // Update price when weight changes (weight mode)
  useEffect(() => {
    if (mode === 'weight' && weight > 0) {
      const calculatedPrice = calculatePriceFromWeight(weight);
      setPrice(Math.round(calculatedPrice * 100) / 100); // Round to 2 decimal places
      onValueChange({ weight, price: calculatedPrice, mode });
    }
  }, [weight, mode, basePricePerKg]);

  // Update weight when price changes (price mode)
  useEffect(() => {
    if (mode === 'price' && price > 0) {
      const calculatedWeight = calculateWeightFromPrice(price);
      setWeight(Math.round(calculatedWeight * 100) / 100); // Round to 2 decimal places
      onValueChange({ weight: calculatedWeight, price, mode });
    }
  }, [price, mode, basePricePerKg]);

  const handleWeightChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setWeight(value);
  };

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPrice(value);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Recalculate values when switching modes
    if (newMode === 'weight' && price > 0) {
      const calculatedWeight = calculateWeightFromPrice(price);
      setWeight(Math.round(calculatedWeight * 100) / 100);
    } else if (newMode === 'price' && weight > 0) {
      const calculatedPrice = calculatePriceFromWeight(weight);
      setPrice(Math.round(calculatedPrice * 100) / 100);
    }
  };

  return (
    <div className="bg-white border-2 border-blue-100 rounded-xl p-4 space-y-4">
      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleModeChange('weight')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === 'weight'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          By Weight
        </button>
        <button
          onClick={() => handleModeChange('price')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === 'price'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          By Price
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        {mode === 'weight' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (grams)
            </label>
            <div className="relative">
              <input
                type="number"
                value={weight}
                onChange={handleWeightChange}
                placeholder="Enter weight in grams"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                min="0"
                step="1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                g
              </span>
            </div>
            {weight > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                ≈ {Math.round(weight / 1000 * 100) / 100} kg
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                ₹
              </span>
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                placeholder="Enter price"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        {/* Display calculated value */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-700 font-medium">
            {mode === 'weight' ? 'Calculated Price:' : 'Calculated Weight:'}
          </div>
          <div className="text-lg font-semibold text-blue-800">
            {mode === 'weight' 
              ? `₹${price.toFixed(2)}` 
              : `${weight.toFixed(0)}g (${Math.round(weight / 1000 * 100) / 100}kg)`
            }
          </div>
        </div>
      </div>

      {/* Base Price Info */}
      <div className="text-xs text-gray-500 text-center">
        Base price: ₹{basePricePerKg}/kg
      </div>
    </div>
  );
}
