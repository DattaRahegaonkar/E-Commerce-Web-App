import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package, MapPin, Phone, Mail, CreditCard,
  ArrowLeft, CheckCircle, Truck, Clock, XCircle
} from 'lucide-react';

const apiBaseUrl = window._env_?.BACKEND_URL || import.meta.env.VITE_API_URL || '';

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/orders/${orderId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setPayment(data.payment);
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':   return 'text-yellow-400 bg-yellow-900 bg-opacity-20';
      case 'confirmed': return 'text-blue-400 bg-blue-900 bg-opacity-20';
      case 'shipped':   return 'text-purple-400 bg-purple-900 bg-opacity-20';
      case 'delivered': return 'text-green-400 bg-green-900 bg-opacity-20';
      case 'cancelled': return 'text-red-400 bg-red-900 bg-opacity-20';
      default:          return 'text-gray-400 bg-gray-900 bg-opacity-20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':   return <Clock size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'shipped':   return <Truck size={16} />;
      case 'delivered': return <Package size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default:          return <Package size={16} />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending':   return 'text-yellow-400';
      case 'failed':    return 'text-red-400';
      case 'refunded':  return 'text-blue-400';
      default:          return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-400 font-mono text-sm mt-1">{order.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Order Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2 text-purple-400" size={22} />
              Order Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID</span>
                <span className="font-mono">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Date</span>
                <span>{new Date(order.orderDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order Status</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="capitalize">{order.orderStatus}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-purple-400 font-bold text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="mr-2 text-purple-400" size={22} />
              Customer Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{order.userId?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span>{order.userId?.email || 'N/A'}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="mr-2 text-purple-400" size={22} />
              Payment Details
            </h2>
            {payment ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Payment Status</span>
                  <span className={`font-semibold capitalize ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span>₹{payment.amount}</span>
                </div>
                {payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID</span>
                    <span className="font-mono text-xs">{payment.transactionId}</span>
                  </div>
                )}
                {payment.paymentGateway && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Gateway</span>
                    <span className="capitalize">{payment.paymentGateway}</span>
                  </div>
                )}
                {payment.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Date</span>
                    <span>{new Date(payment.paymentDate).toLocaleString()}</span>
                  </div>
                )}
                {payment.metadata?.upiId && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">UPI ID</span>
                    <span>{payment.metadata.upiId}</span>
                  </div>
                )}
                {payment.metadata?.cardLastFour && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Card</span>
                    <span>•••• •••• •••• {payment.metadata.cardLastFour}</span>
                  </div>
                )}
                {payment.metadata?.bank && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank</span>
                    <span className="uppercase">{payment.metadata.bank}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No payment record found</p>
            )}
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 text-purple-400" size={22} />
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-white">{order.shippingAddress.name}</p>
              <p className="text-gray-300">{order.shippingAddress.address}</p>
              <p className="text-gray-300">{order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
              <p className="flex items-center text-gray-300">
                <Phone size={14} className="mr-2 text-gray-400" />
                {order.shippingAddress.phone}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 mt-6"
        >
          <h2 className="text-xl font-semibold mb-4">
            Order Items ({order.items.length})
          </h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-400 text-sm">{item.company}</p>
                  <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-400">₹{item.price * item.quantity}</p>
                  <p className="text-gray-400 text-sm">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-600 mt-4 pt-4 flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-bold text-purple-400">₹{order.totalAmount}</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminOrderDetail;
