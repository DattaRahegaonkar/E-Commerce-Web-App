import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Plus, Edit, Trash2, Star, ArrowLeft } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const navigate = useNavigate();

  const [addressForm, setAddressForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/addresses`, {
        credentials: 'include'
      });

      if (response.ok) {
        const addressesData = await response.json();
        setAddresses(addressesData);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingAddress
        ? `${apiBaseUrl}/api/addresses/${editingAddress._id}`
        : `${apiBaseUrl}/api/addresses`;

      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
        credentials: 'include'
      });

      if (response.ok) {
        await fetchAddresses();
        setShowAddressForm(false);
        setEditingAddress(null);
        resetAddressForm();
        alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchAddresses();
        alert('Address deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      isDefault: false
    });
  };

  const handleInputChange = (field, value) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Shopping
          </button>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <User className="mr-3 text-purple-400" size={24} />
                <h2 className="text-xl font-semibold">Profile Information</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Role</label>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPin className="mr-3 text-purple-400" size={24} />
                  <h2 className="text-xl font-semibold">My Addresses</h2>
                </div>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    resetAddressForm();
                    setShowAddressForm(true);
                  }}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Add Address
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-4 mb-6">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No addresses added yet</p>
                    <p className="text-sm text-gray-500">Add your first address to get started</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div key={address._id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold mr-2">{address.name}</h3>
                            {address.isDefault && (
                              <span className="flex items-center text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                                <Star size={12} className="mr-1" />
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-1">{address.address}</p>
                          <p className="text-gray-300 text-sm mb-1">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-gray-300 text-sm">📞 {address.phone}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    value={addressForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode</label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-sm">Set as default address</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      resetAddressForm();
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingAddress ? 'Update' : 'Add'} Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
