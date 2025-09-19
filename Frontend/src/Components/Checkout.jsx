import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, ArrowLeft } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    if (useDefaultAddress) {
      fetchDefaultAddress();
    }
  }, [useDefaultAddress]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/cart`, {
        credentials: 'include'
      });

      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);

        if (cartData.items.length === 0) {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/addresses/default`, {
        credentials: 'include'
      });

      if (response.ok) {
        const defaultAddress = await response.json();
        setShippingAddress({
          name: defaultAddress.name,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          phone: defaultAddress.phone
        });
      } else {
        // No default address found, user needs to enter manually
        setUseDefaultAddress(false);
      }
    } catch (error) {
      console.error('Error fetching default address:', error);
      setUseDefaultAddress(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate address fields if not using default address
    if (!useDefaultAddress) {
      if (!shippingAddress.name.trim()) newErrors.name = 'Name is required';
      if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
      if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
      if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
      if (!shippingAddress.pincode.trim()) newErrors.pincode = 'Pincode is required';
      if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Order placed successfully:', result);

        if (paymentMethod === 'online') {
          // Redirect to payment page with order details
          console.log('Redirecting to payment page:', `/payment/${result.order.orderId}?amount=${result.order.totalAmount}&currency=INR`);
          navigate(`/payment/${result.order.orderId}?amount=${result.order.totalAmount}&currency=INR`);
        } else {
          // COD - redirect to order confirmation
          console.log('Redirecting to:', `/order-confirmation/${result.order.orderId}`);
          navigate(`/order-confirmation/${result.order.orderId}`);
        }
      } else {
        alert(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Shopping
          </button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="mr-2 text-purple-400" size={24} />
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  Manage Addresses
                </button>
              </div>

              {/* Default Address Toggle */}
              <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDefaultAddress}
                    onChange={(e) => {
                      setUseDefaultAddress(e.target.checked);
                      if (e.target.checked) {
                        fetchDefaultAddress();
                      } else {
                        setShippingAddress({
                          name: '',
                          address: '',
                          city: '',
                          state: '',
                          pincode: '',
                          phone: ''
                        });
                      }
                    }}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium">Use my default address</span>
                </label>
                {useDefaultAddress && (
                  <p className="text-xs text-gray-400 mt-2">
                    Your saved default address will be used for this order
                  </p>
                )}
              </div>

              {!useDefaultAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={shippingAddress.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white resize-none"
                    placeholder="Enter your complete address"
                  />
                  {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                    placeholder="Enter pincode"
                  />
                  {errors.pincode && <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <CreditCard className="mr-2 text-purple-400" size={24} />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-400">Pay when you receive your order</div>
                  </div>
                </label>

                <label className="flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Online Payment</div>
                    <div className="text-sm text-gray-400">Pay securely with card/UPI/wallet</div>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 h-fit"
          >
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.productId._id} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm line-clamp-2">{item.productId.name}</h3>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Subtotal</span>
                <span>₹{cart.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-gray-600 pt-2">
                <span>Total</span>
                <span className="text-purple-400">₹{cart.totalAmount}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Truck className="mr-2" size={20} />
                  Place Order
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;