import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OrderNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkOrderUpdates = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/orders/notifications`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Check for updates every 30 seconds
    const interval = setInterval(checkOrderUpdates, 30000);
    checkOrderUpdates(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">Order Update</h4>
                <p className="text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotifications;