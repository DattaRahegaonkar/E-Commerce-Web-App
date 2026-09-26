import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const apiBaseUrl = window._env_?.BACKEND_URL || import.meta.env.VITE_API_URL || '';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
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
        navigate('/signup');
      }
    };

    performLogout();
  }, []);

  return (
    <div className='text-3xl font-semibold mt-6 text-center text-white'>
      Logging out...
    </div>
  );
}

export default Logout
