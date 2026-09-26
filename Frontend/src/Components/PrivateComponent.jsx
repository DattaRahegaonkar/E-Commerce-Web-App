import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";

const apiBaseUrl = window._env_?.BACKEND_URL || import.meta.env.VITE_API_URL || '';

const PrivateComponent = () => {
  const [authState, setAuthState] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/me`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // Keep localStorage in sync with server user data
          localStorage.setItem("user", JSON.stringify(data.user));
          setAuthState("authenticated");
        } else {
          // Cookie invalid or expired — clear stale localStorage
          localStorage.removeItem("user");
          setAuthState("unauthenticated");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("user");
        setAuthState("unauthenticated");
      }
    };

    verifyAuth();
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return authState === "authenticated" ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateComponent;
