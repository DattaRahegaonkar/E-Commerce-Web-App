import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Smartphone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [paymentData, setPaymentData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(''); // 'processing', 'success', 'failed'

  useEffect(() => {
    // Get payment data from URL params or fetch from API
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

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard size={24} />,
      description: 'Visa, Mastercard, RuPay',
      fields: ['cardNumber', 'expiry', 'cvv', 'name']
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone size={24} />,
      description: 'Google Pay, PhonePe, Paytm',
      fields: ['upiId']
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <CreditCard size={24} />,
      description: 'All major banks',
      fields: ['bank']
    }
  ];

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    upiId: '',
    bank: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return false;
    }

    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method) return false;

    // Special validation for UPI - accept any input
    if (selectedMethod === 'upi') {
      if (!formData.upiId || formData.upiId.trim() === '') {
        alert('Please enter your UPI ID');
        return false;
      }
      // For UPI, accept any format (no strict validation)
      return true;
    }

    // Standard validation for other methods
    for (const field of method.fields) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setPaymentStatus('processing');

    try {
      console.log('Starting payment process for:', { orderId, selectedMethod, formData });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, always succeed
      setPaymentStatus('success');
      console.log('Payment status set to success');

      // Complete the payment - update order and payment status
      const paymentData = {
        orderId,
        paymentMethod: selectedMethod,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        upiId: selectedMethod === 'upi' ? formData.upiId : undefined,
        cardNumber: selectedMethod === 'card' ? formData.cardNumber : undefined,
        bank: selectedMethod === 'netbanking' ? formData.bank : undefined
      };

      console.log('Sending payment verification request:', paymentData);

      const response = await fetch(`${apiBaseUrl}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
        credentials: 'include'
      });

      console.log('Payment verification response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Payment verification successful:', result);

        if (result.success) {
          // Redirect to order confirmation after successful payment
          setTimeout(() => {
            console.log('Redirecting to order confirmation:', `/order-confirmation/${orderId}`);
            navigate(`/order-confirmation/${orderId}`);
          }, 1500);
        } else {
          setPaymentStatus('failed');
        }
      } else {
        const error = await response.json();
        console.error('Payment verification failed:', error);
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
    } finally {
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
              {paymentData.currency} {paymentData.amount}
            </span>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors ${
                  selectedMethod === method.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-4"
                />
                <div className="flex items-center flex-1">
                  <div className="text-purple-400 mr-3">
                    {method.icon}
                  </div>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-400">{method.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Payment Form */}
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {paymentMethods.find(m => m.id === selectedMethod)?.name} Details
            </h3>

            <div className="space-y-4">
              {selectedMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                      maxLength="19"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                        maxLength="4"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                    />
                  </div>
                </>
              )}

              {selectedMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium mb-2">UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi or yourname@paytm"
                    value={formData.upiId}
                    onChange={(e) => handleInputChange('upiId', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter your UPI ID (e.g., username@upi, username@paytm, username@phonepe)
                  </p>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Bank</label>
                  <select
                    value={formData.bank}
                    onChange={(e) => handleInputChange('bank', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                  >
                    <option value="">Choose your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                    <option value="other">Other Bank</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Pay Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handlePayment}
          disabled={loading || !selectedMethod || paymentStatus === 'success'}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <CreditCard className="mr-2" size={20} />
          )}
          {loading ? 'Processing...' : `Pay ${paymentData.currency} ${paymentData.amount}`}
        </motion.button>

        {/* Security Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;