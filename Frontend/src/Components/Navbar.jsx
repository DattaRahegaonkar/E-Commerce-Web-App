import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import Cart from "./Cart";
import "./Navbar.css";

const apiBaseUrl = window._env_?.BACKEND_URL || import.meta.env.VITE_API_URL || '';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [showCart, setShowCart] = useState(false);

  const loadUser = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setAuth(userData);
    } else {
      setUser(null);
      setAuth(null);
    }
  };

  useEffect(() => {
    // Load on mount
    loadUser();

    // Listen for login/logout events dispatched by Login, Signup, Logout components
    window.addEventListener('authChange', loadUser);
    return () => window.removeEventListener('authChange', loadUser);
  }, []);

  const logout = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.dispatchEvent(new Event('authChange'));
      navigate("/signup");
    }
  };

  useEffect(() => {
    if (auth) {
      fetchCartCount();
    }
  }, [auth]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/cart`, {
        credentials: 'include'
      });

      if (response.ok) {
        const cartData = await response.json();
        const totalItems = cartData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartItemsCount(totalItems);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
    navigate(`/?search=${encodeURIComponent(term)}`);
    setSearch("");
    setIsOpen(false);
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  return (
    <nav className="shadow-md bg-gradient-to-r from-gray-900 via-black to-gray-900 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo Section */}
          <NavLink
            to={auth ? "/" : "/signup"}
            className="text-xl sm:text-2xl font-extrabold tracking-wide text-purple-400 hover:text-purple-500 transition"
          >
            Logo
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            {auth ? (
              <>
                <NavLink to="/" className="nav-link text-gray-200 hover:text-purple-400">
                  Products
                </NavLink>
                {user?.role === 'admin' && (
                  <>
                    <NavLink to="/add" className="nav-link text-gray-200 hover:text-purple-400">
                      Add Product
                    </NavLink>
                    <NavLink to="/admin" className="nav-link text-blue-400 hover:text-blue-300">
                      Admin Dashboard
                    </NavLink>
                  </>
                )}
                {user?.role !== 'admin' && (
                  <NavLink to="/orders" className="nav-link text-gray-200 hover:text-purple-400">
                    Orders
                  </NavLink>
                )}
                <NavLink to="/profile" className="nav-link text-gray-200 hover:text-purple-400">
                  Profile
                </NavLink>
                <NavLink
                  to="/signup"
                  className="nav-link text-red-400 hover:text-red-500 font-semibold"
                  onClick={logout}
                >
                  Logout ({user?.name})
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" className="nav-link text-gray-200 hover:text-purple-400">
                  Products
                </NavLink>
                <NavLink to="/signup" className="nav-link text-gray-200 hover:text-purple-400">
                  SignUp
                </NavLink>
                <NavLink to="/login" className="nav-link text-gray-200 hover:text-purple-400">
                  Login
                </NavLink>
              </>
            )}
          </div>

          {/* Search Input — authenticated users, desktop only */}
          {auth && (
            <div className="hidden md:flex">
              <form className="flex items-center" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="h-10 w-48 sm:w-56 lg:w-64 rounded-full pl-4 sm:pl-5 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm sm:text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-2 px-3 sm:px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition text-sm sm:text-base flex items-center gap-1"
                >
                  <Search size={16} />
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Cart Icon - Only for Customers */}
          {auth && user?.role === 'user' && (
            <div className="relative">
              <button
                onClick={toggleCart}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors relative"
              >
                <ShoppingCart size={20} className="text-gray-200" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors p-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 p-3 sm:p-4 space-y-3 sm:space-y-4 text-center shadow-inner">
          {auth ? (
            <>
              <NavLink to="/" className="block nav-link text-gray-200 hover:text-purple-400">
                Products
              </NavLink>
              {user?.role === 'admin' && (
                <>
                  <NavLink to="/add" className="block nav-link text-gray-200 hover:text-purple-400">
                    Add Product
                  </NavLink>
                  <NavLink to="/admin" className="block nav-link text-blue-400 hover:text-blue-300">
                    Admin Dashboard
                  </NavLink>
                </>
              )}
              {user?.role !== 'admin' && (
                <NavLink to="/orders" className="block nav-link text-gray-200 hover:text-purple-400">
                  Orders
                </NavLink>
              )}
              <NavLink to="/profile" className="block nav-link text-gray-200 hover:text-purple-400">
                Profile
              </NavLink>

              {/* Mobile Search — authenticated users only */}
              <form className="flex items-center gap-2 px-2" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 h-10 rounded-full pl-4 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition text-sm"
                >
                  <Search size={16} />
                </button>
              </form>

              <NavLink
                to="/signup"
                className="block nav-link text-red-400 hover:text-red-500 font-semibold"
                onClick={logout}
              >
                Logout ({user?.name})
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" className="block nav-link text-gray-200 hover:text-purple-400">
                Products
              </NavLink>
              <NavLink to="/signup" className="block nav-link text-gray-200 hover:text-purple-400">
                SignUp
              </NavLink>
              <NavLink to="/login" className="block nav-link text-gray-200 hover:text-purple-400">
                Login
              </NavLink>
            </>
          )}
        </div>
      )}

      {/* Cart Component */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
    </nav>
  );
};

export default Navbar;
