import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maliPoints, setMaliPoints] = useState(0);

  useEffect(() => {
    // Check local storage for existing token/user
    const savedUser = localStorage.getItem('uzamali_user');
    const savedPoints = localStorage.getItem('uzamali_points');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedPoints) {
      setMaliPoints(parseInt(savedPoints));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('uzamali_user', JSON.stringify(userData));
    // Reset points for mock login
    const initialPoints = userData.role === 'farmer' ? 150 : 0;
    setMaliPoints(initialPoints);
    localStorage.setItem('uzamali_points', initialPoints.toString());
  };

  const logout = () => {
    setUser(null);
    setMaliPoints(0);
    localStorage.removeItem('uzamali_user');
    localStorage.removeItem('uzamali_token');
    localStorage.removeItem('uzamali_points');
  };

  const addPoints = (amount) => {
    const newPoints = maliPoints + amount;
    setMaliPoints(newPoints);
    localStorage.setItem('uzamali_points', newPoints.toString());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, maliPoints, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
