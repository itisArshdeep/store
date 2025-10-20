'use client';

import { useState, useEffect } from 'react';
import NotificationModal from './NotificationModal';
import ConfirmationModal from './ConfirmationModal';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [confirmationData, setConfirmationData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    hasWeightPricing: false,
    category: 'snacks',
    isBestseller: false,
    available: true,
    image: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.data.imageId }));
        setImagePreview(data.data.url);
        setNotificationData({
          type: 'success',
          title: 'Image Uploaded',
          message: 'Product image uploaded successfully!'
        });
        setShowNotification(true);
      } else {
        console.error('Upload failed:', data.error);
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setNotificationData({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload image. Please try again.'
      });
      setShowNotification(true);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Upload image
      handleImageUpload(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if image is still uploading
    if (uploadingImage) {
      setNotificationData({
        type: 'warning',
        title: 'Please Wait',
        message: 'Image is still uploading. Please wait...'
      });
      setShowNotification(true);
      return;
    }
    
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchProducts();
        resetForm();
        setShowEditModal(false);
        setNotificationData({
          type: 'success',
          title: 'Success',
          message: editingProduct ? 'Product updated successfully!' : 'Product added successfully!'
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || 'An error occurred. Please try again.'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Product operation error:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'An error occurred. Please try again.'
      });
      setShowNotification(true);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      hasWeightPricing: product.hasWeightPricing,
      category: product.category,
      isBestseller: product.isBestseller,
      available: product.available,
      image: product.image || ''
    });
    setImagePreview(product.image ? `/api/images/${product.image}` : null);
    setShowEditModal(true);
  };

  const handleToggleAvailability = (productId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    setConfirmationData({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
      message: `Are you sure you want to ${action} this product?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: () => performToggleAvailability(productId, currentStatus)
    });
    setShowConfirmation(true);
  };

  const performToggleAvailability = async (productId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          available: !currentStatus
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchProducts();
        setNotificationData({
          type: 'success',
          title: 'Success',
          message: `Product ${action}d successfully!`
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || `Failed to ${action} product`
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error(`Failed to ${action} product:`, error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: `Failed to ${action} product`
      });
      setShowNotification(true);
    }
  };

  const handleDeleteProduct = (productId, productName) => {
    setConfirmationData({
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete "${productName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => performDeleteProduct(productId)
    });
    setShowConfirmation(true);
  };

  const performDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchProducts();
        setNotificationData({
          type: 'success',
          title: 'Success',
          message: 'Product deleted successfully!'
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to delete product'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      setNotificationData({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete product'
      });
      setShowNotification(true);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      hasWeightPricing: false,
      category: 'snacks',
      isBestseller: false,
      available: true,
      image: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingProduct(null);
    setShowAddForm(false);
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Add New Product
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Product
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.hasWeightPricing ? 'Price per kg *' : 'Base Price *'}
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder={formData.hasWeightPricing ? "Enter price per kg (e.g., 400)" : "Enter base price"}
                />
                {formData.hasWeightPricing && (
                  <p className="text-xs text-gray-500 mt-1">
                    System will automatically calculate price for different weights
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                >
                  <option value="snacks">Snacks</option>
                  <option value="sweets">Sweets</option>
                  <option value="pakoda">Pakoda</option>
                  <option value="paneer">Paneer</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none"
                  placeholder="Enter product description"
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                  {uploadingImage && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Uploading image...
                    </div>
                  )}
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hasWeightPricing"
                  checked={formData.hasWeightPricing}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Weight-based pricing</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={formData.isBestseller}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Bestseller</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Available</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploadingImage}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  uploadingImage 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {uploadingImage ? 'Uploading...' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
            {/* Header with dietary indicator and status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                <span className="text-xs text-gray-600">Veg</span>
                {product.isBestseller && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                    Bestseller
                  </span>
                )}
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                product.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.available ? 'Available' : 'Disabled'}
              </span>
            </div>

            {/* Product Image */}
            {product.image && (
              <div className="mb-4">
                <img
                  src={`/api/images/${product.image}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Product name */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-bold text-gray-800">
                ₹{product.basePrice}
                {product.hasWeightPricing ? (
                  <span className="text-gray-500">/kg</span>
                ) : (
                  <span className="text-gray-500"> each</span>
                )}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3 flex-grow">
              {product.description}
            </p>

            {/* Category */}
            <div className="mb-4">
              <span className="text-sm text-gray-500">Category: </span>
              <span className="text-sm font-medium text-gray-800 capitalize">
                {product.category}
              </span>
            </div>

            {/* Image placeholder */}
            <div className="mb-4 flex-shrink-0">
              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-1">
                    {product.category === 'snacks' && '🥟'}
                    {product.category === 'sweets' && '🍯'}
                    {product.category === 'pakoda' && '🥘'}
                    {product.category === 'paneer' && '🧀'}
                  </div>
                  <div className="text-xs text-gray-500">{product.name}</div>
                </div>
              </div>
            </div>

            {/* Bottom section - actions */}
            <div className="mt-auto">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleAvailability(product._id, product.available)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    product.available 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {product.available ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id, product.name)}
                  className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  title="Delete Product"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">Edit Product</h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.hasWeightPricing ? 'Price per kg *' : 'Base Price *'}
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      placeholder={formData.hasWeightPricing ? "Enter price per kg (e.g., 400)" : "Enter base price"}
                    />
                    {formData.hasWeightPricing && (
                      <p className="text-xs text-gray-500 mt-1">
                        System will automatically calculate price for different weights
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    >
                      <option value="snacks">Snacks</option>
                      <option value="sweets">Sweets</option>
                      <option value="pakoda">Pakoda</option>
                      <option value="paneer">Paneer</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image
                    </label>
                    <div className="space-y-3">
                      {editingProduct?.image && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                          <img
                            src={`/api/images/${editingProduct.image}`}
                            alt="Current product"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      />
                      {uploadingImage && (
                        <div className="flex items-center text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Uploading image...
                        </div>
                      )}
                      {imagePreview && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasWeightPricing"
                      checked={formData.hasWeightPricing}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Weight-based pricing</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isBestseller"
                      checked={formData.isBestseller}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Bestseller</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                      uploadingImage 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {uploadingImage ? 'Uploading...' : 'Update Product'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
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
      />
    </div>
  );
}
