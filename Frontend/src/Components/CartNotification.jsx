import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CartNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [cartItems, setCartItems] = useState(0);

  useEffect(() => {
    const checkCartBeforeLeave = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "{}");
      if (cart.itemCount > 0) {
        setCartItems(cart.itemCount);
        setShowNotification(true);
      }
    };

    const handleBeforeUnload = (e) => {
      const cart = JSON.parse(localStorage.getItem("cart") || "{}");
      if (cart.itemCount > 0) {
        e.preventDefault();
        e.returnValue = `You have ${cart.itemCount} items in your cart. Are you sure you want to leave?`;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50"
        >
          <p>You have {cartItems} items in your cart!</p>
          <button
            onClick={() => setShowNotification(false)}
            className="mt-2 px-3 py-1 bg-white text-purple-600 rounded text-sm"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartNotification;