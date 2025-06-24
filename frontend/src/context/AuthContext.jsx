import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Optional: Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email,
          });
          setToken(storedToken);
        } else {
          // Token is expired
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      localStorage.setItem('token', newToken);
      setUser({
        id: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      });
      setToken(newToken);
      return decoded.role;
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      // Handle login failure if needed
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 