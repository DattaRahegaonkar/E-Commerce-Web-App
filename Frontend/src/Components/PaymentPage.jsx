import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const apiBaseUrl = window._env_?.BACKEND_URL || import.meta.env.VITE_API_URL || '';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(''); // 'processing', 'success', 'failed'

  useEffect(() => {
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency') || 'INR';

    if (amount) {
      setPaymentData({
        orderId,
        amount: parseFloat(amount),
        currency
      });
    }
  }, [orderId, searchParams]);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStatus('processing');

    try {
      // Step 1: Create Razorpay order from backend
      const initiateRes = await fetch(`${apiBaseUrl}/api/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
        credentials: 'include'
      });

      if (!initiateRes.ok) {
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      const initiateData = await initiateRes.json();

      // Step 2: Open Razorpay checkout popup
      const options = {
        key: initiateData.keyId || window._env_?.RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: initiateData.amount,
        currency: initiateData.currency,
        name: 'E-Commerce App',
        description: `Order ${orderId}`,
        order_id: initiateData.razorpayOrderId,
        config_id: 'config_TghVNic5XOk4VE',
        handler: async function (response) {
          // Step 3: Verify payment signature on backend
          const verifyRes = await fetch(`${apiBaseUrl}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }),
            credentials: 'include'
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setPaymentStatus('success');
            setTimeout(() => {
              navigate(`/order-confirmation/${orderId}`);
            }, 1500);
          } else {
            setPaymentStatus('failed');
          }
        },
        prefill: {
          name: '',
          email: ''
        },
        theme: {
          color: '#7c3aed'
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Checkout
          </button>
          <h1 className="text-3xl font-bold">Complete Payment</h1>
        </div>

        {/* Payment Status */}
        {paymentStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              paymentStatus === 'processing' ? 'bg-blue-900 bg-opacity-50' :
              paymentStatus === 'success' ? 'bg-green-900 bg-opacity-50' :
              'bg-red-900 bg-opacity-50'
            }`}
          >
            <div className="flex items-center">
              {paymentStatus === 'processing' && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
                  <span>Processing payment...</span>
                </>
              )}
              {paymentStatus === 'success' && (
                <>
                  <CheckCircle size={20} className="text-green-400 mr-3" />
                  <span>Payment successful! Redirecting...</span>
                </>
              )}
              {paymentStatus === 'failed' && (
                <>
                  <AlertCircle size={20} className="text-red-400 mr-3" />
                  <span>Payment failed. Please try again.</span>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Order ID:</span>
            <span className="font-mono">{orderId}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-400">Amount:</span>
            <span className="text-2xl font-bold text-purple-400">
              ₹{paymentData.amount}
            </span>
          </div>
        </motion.div>

        {/* Pay Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handlePayment}
          disabled={loading || paymentStatus === 'success'}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading && paymentStatus === 'processing' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <CreditCard className="mr-2" size={20} />
          )}
          {loading && paymentStatus === 'processing' ? 'Opening Payment...' : `Pay ₹${paymentData.amount}`}
        </motion.button>

        {/* Security Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            🔒 Secured by Razorpay — UPI, Card, Netbanking supported
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
