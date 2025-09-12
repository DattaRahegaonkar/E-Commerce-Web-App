import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Import icons for mobile menu
import "./Navbar.css";

const Navbar = () => {
  const auth = localStorage.getItem("user");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.clear();
    navigate("/signup");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch("");
  };

  return (
    <nav className="shadow-md bg-gradient-to-r from-gray-900 via-black to-gray-900 sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <NavLink
            to={auth ? "/" : "/signup"}
            className="text-2xl font-extrabold tracking-wide text-purple-400 hover:text-purple-500 transition"
          >
            Logo
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {auth ? (
              <>
                <NavLink to="/" className="nav-link text-gray-200 hover:text-purple-400">
                  Products
                </NavLink>
                <NavLink to="/add" className="nav-link text-gray-200 hover:text-purple-400">
                  Add Product
                </NavLink>
                <NavLink to="/profile" className="nav-link text-gray-200 hover:text-purple-400">
                  Profile
                </NavLink>
                <NavLink
                  to="/signup"
                  className="nav-link text-red-400 hover:text-red-500 font-semibold"
                  onClick={logout}
                >
                  Logout ({JSON.parse(auth).name})
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

          {/* Search Input (Hidden on small screens) */}
          {auth && (
            <div className="hidden md:flex">
              <form className="flex items-center" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search"
                  className="h-10 w-64 rounded-full pl-5 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-2 px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 p-4 space-y-4 text-center shadow-inner">
          {auth ? (
            <>
              <NavLink to="/" className="block nav-link text-gray-200 hover:text-purple-400">
                Products
              </NavLink>
              <NavLink to="/add" className="block nav-link text-gray-200 hover:text-purple-400">
                Add Product
              </NavLink>
              <NavLink to="/profile" className="block nav-link text-gray-200 hover:text-purple-400">
                Profile
              </NavLink>
              <NavLink
                to="/signup"
                className="block nav-link text-red-400 hover:text-red-500 font-semibold"
                onClick={logout}
              >
                Logout ({JSON.parse(auth).name})
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
    </nav>
  );
};

export default Navbar;
