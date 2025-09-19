import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, Phone, Mail } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('OrderConfirmation - orderId from params:', orderId);
    if (orderId) {
      fetchOrderDetails();
    } else {
      console.log('OrderConfirmation - No orderId in params, redirecting to orders');
      navigate('/orders');
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      console.log('OrderConfirmation - Fetching order details for:', orderId);
      const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}`, {
        credentials: 'include'
      });

      console.log('OrderConfirmation - Response status:', response.status);

      if (response.ok) {
        const orderData = await response.json();
        console.log('OrderConfirmation - Order data received:', orderData);
        setOrder(orderData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('OrderConfirmation - Error response:', errorData);
        // If order not found, redirect to orders page
        navigate('/orders');
      }
    } catch (error) {
      console.error('OrderConfirmation - Error fetching order:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'shipped': return 'text-purple-400';
      case 'delivered': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4"
          >
            <CheckCircle size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-400 text-lg">Thank you for your purchase</p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="mr-2 text-purple-400" size={24} />
                Order Details
              </h2>
              <div className="space-y-2">
                <p><span className="text-gray-400">Order ID:</span> <span className="font-mono">{order.orderId}</span></p>
                <p><span className="text-gray-400">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}</p>
                <p><span className="text-gray-400">Payment Method:</span> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                <p><span className="text-gray-400">Status:</span> <span className={`font-semibold ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)} {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span></p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="mr-2 text-purple-400" size={24} />
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
                <p className="flex items-center">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-400">{item.company}</p>
                  <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                  <p className="text-sm text-gray-400">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="border-t border-gray-600 mt-6 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-purple-400">₹{order.totalAmount}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Truck className="mr-2 text-purple-400" size={24} />
            Order Tracking
          </h2>

          <div className="space-y-4">
            {['pending', 'confirmed', 'shipped', 'delivered'].map((status, index) => {
              const isCompleted = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.orderStatus) >= index;
              const isCurrent = order.orderStatus === status;

              return (
                <div key={status} className={`flex items-center space-x-4 p-3 rounded-lg ${isCurrent ? 'bg-purple-900 bg-opacity-50' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-purple-400">
                        {status === 'pending' && 'Your order is being processed'}
                        {status === 'confirmed' && 'Your order has been confirmed'}
                        {status === 'shipped' && 'Your order is on the way'}
                        {status === 'delivered' && 'Your order has been delivered'}
                      </p>
                    )}
                  </div>
                  {isCompleted && <CheckCircle size={20} className="text-green-400" />}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View All Orders
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;