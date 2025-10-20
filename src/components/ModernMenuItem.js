'use client';

import { useState } from 'react';

export default function ModernMenuItem({ 
  item, 
  onAddToCart,
  onOpenPakodaModal,
  cartItems = [],
  onUpdateCartQuantity,
  onRemoveFromCart,
  onOpenCart
}) {
  const [quantity, setQuantity] = useState(1);
  
  // Check if this item is in cart (for both regular and weight-based items)
  const cartItem = cartItems.find(cartItem => 
    cartItem.id === item._id && !cartItem.hasWeightPricing
  );
  const weightBasedCartItems = cartItems.filter(cartItem => 
    cartItem.id === item._id && cartItem.hasWeightPricing
  );
  const isInCart = !!cartItem;
  const hasWeightBasedItems = weightBasedCartItems.length > 0;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleUpdateCartQuantity = (newQuantity) => {
    onUpdateCartQuantity(item._id, newQuantity);
  };

  const handleAddSameWeightItem = () => {
    // Get the last added weight-based item to use same weight/price
    const lastWeightItem = weightBasedCartItems[weightBasedCartItems.length - 1];
    if (lastWeightItem) {
      const sameItem = {
        id: item._id,
        name: item.name,
        basePrice: item.basePrice,
        quantity: 1,
        weight: lastWeightItem.weight,
        price: lastWeightItem.price,
        mode: lastWeightItem.mode,
        totalPrice: lastWeightItem.price,
        hasWeightPricing: true,
        cartId: Date.now() + Math.random()
      };
      onAddToCart(sameItem);
    }
  };

  const handleAddToCart = () => {
    if (item.hasWeightPricing) {
      onOpenPakodaModal(item);
    } else {
      const cartItem = {
        id: item._id,
        name: item.name,
        basePrice: item.basePrice,
        quantity: 1,
        totalPrice: item.basePrice,
        hasWeightPricing: false
      };
      onAddToCart(cartItem);
      setQuantity(1);
    }
  };

  const getDietaryIndicator = () => {
    if (item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('mix')) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-sm"></div>
          </div>
          <span className="text-xs text-gray-600">Veg</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
          <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-white"></div>
        </div>
        <span className="text-xs text-gray-600">Non-Veg</span>
      </div>
    );
  };

  const getRating = () => {
    const ratings = {
      'Samosa': { stars: 4.5, count: 127 },
      'Jalebi': { stars: 4.3, count: 89 },
      'Pakode Mix': { stars: 4.6, count: 203 },
      'Paneer Pakoda': { stars: 4.7, count: 156 },
      'Fresh Paneer': { stars: 4.4, count: 98 }
    };
    return ratings[item.name] || { stars: 4.5, count: 50 };
  };

  const getImageUrl = () => {
    // Use actual product image if available, otherwise use placeholder
    if (item.image) {
      return `/api/images/${item.image}`;
    }
    
    // Fallback to placeholder images
    const images = {
      'Samosa': '/api/placeholder/120/120',
      'Jalebi': '/api/placeholder/120/120', 
      'Pakode Mix': '/api/placeholder/120/120',
      'Paneer Pakoda': '/api/placeholder/120/120',
      'Fresh Paneer': '/api/placeholder/120/120'
    };
    return images[item.name] || '/api/placeholder/120/120';
  };

  const rating = getRating();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      {/* Header with dietary indicator and rating */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getDietaryIndicator()}
          {item.name === 'Pakode Mix' && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
              Bestseller
            </span>
          )}
          {!item.available && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              Unavailable
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-sm font-medium text-gray-700">{rating.stars}</span>
          <span className="text-xs text-gray-500">({rating.count})</span>
        </div>
      </div>

      {/* Item name */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
        {item.name}
      </h3>

      {/* Price */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg font-bold text-gray-800">
          ₹{item.hasWeightPricing ? `${item.basePrice}/kg` : item.basePrice}
        </span>
        {!item.hasWeightPricing && (
          <span className="text-sm text-gray-500">each</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3 flex-grow">
        {item.description}
      </p>

      {/* Product Image */}
      <div className="mb-4 flex-shrink-0">
        <img
          src={getImageUrl()}
          alt={item.name}
          className="w-full h-24 object-cover rounded-lg border border-gray-200"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.src = '/api/placeholder/120/120';
          }}
        />
      </div>

      {/* Bottom section - fixed at bottom */}
      <div className="mt-auto">
        {/* Quantity selector for regular items */}
        {!item.hasWeightPricing && isInCart && cartItem && item.available && (
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => handleUpdateCartQuantity(cartItem.quantity - 1)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              −
            </button>
            <span className="mx-3 text-lg font-bold text-gray-800 min-w-[2rem] text-center">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => handleUpdateCartQuantity(cartItem.quantity + 1)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              +
            </button>
          </div>
        )}

        {/* Quantity selector for weight-based items */}
        {item.hasWeightPricing && hasWeightBasedItems && item.available && (
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => {
                if (weightBasedCartItems.length <= 1) {
                  // Remove all weight-based items of this type
                  onUpdateCartQuantity(item._id, 0);
                } else {
                  // Remove the last added weight-based item
                  const lastItem = weightBasedCartItems[weightBasedCartItems.length - 1];
                  onRemoveFromCart(lastItem.cartId);
                }
              }}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              −
            </button>
            <span className="mx-3 text-lg font-bold text-gray-800 min-w-[2rem] text-center">
              {weightBasedCartItems.length}
            </span>
            <button
              onClick={handleAddSameWeightItem}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              +
            </button>
          </div>
        )}

        {/* Total price for regular items */}
        {!item.hasWeightPricing && isInCart && cartItem && (
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-lg font-bold text-blue-600">
              ₹{cartItem.totalPrice.toFixed(2)}
            </div>
          </div>
        )}

        {/* Total price for weight-based items */}
        {item.hasWeightPricing && hasWeightBasedItems && (
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-lg font-bold text-blue-600">
              ₹{weightBasedCartItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
            </div>
          </div>
        )}

        {/* Add button - show different text based on cart status */}
        {!item.hasWeightPricing && (
          <button
            onClick={item.available ? (isInCart ? onOpenCart : handleAddToCart) : null}
            disabled={!item.available}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
              !item.available
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {!item.available ? 'Currently not available' : (isInCart ? '🛒' : 'ADD')}
          </button>
        )}

        {/* Weight-based item buttons */}
        {item.hasWeightPricing && (
          <div className="space-y-2">
            {!item.available ? (
              <button
                disabled
                className="w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Currently not available
              </button>
            ) : !hasWeightBasedItems ? (
              <button
                onClick={handleAddToCart}
                className="w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white"
              >
                ADD
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddSameWeightItem}
                  className="py-2 px-3 rounded-lg font-medium transition-colors duration-200 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                >
                  ADD SAME
                </button>
                <button
                  onClick={handleAddToCart}
                  className="py-2 px-3 rounded-lg font-medium transition-colors duration-200 bg-gray-500 hover:bg-gray-600 text-white text-sm"
                >
                  CUSTOMIZE
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Customizable text */}
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            {item.hasWeightPricing ? 'Weight/Price Customizable' : 'Customizable'}
          </span>
        </div>
      </div>
    </div>
  );
}
