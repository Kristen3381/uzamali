import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maliPoints, setMaliPoints] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('uzamali_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        setMaliPoints(res.data.user.maliPoints ?? 0);
      })
      .catch(() => {
        localStorage.removeItem('uzamali_token');
        localStorage.removeItem('uzamali_points');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('uzamali_token', data.token);
    localStorage.setItem('uzamali_user', JSON.stringify(data.user));
    localStorage.setItem('uzamali_points', data.user.maliPoints.toString());
    setUser(data.user);
    setMaliPoints(data.user.maliPoints);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('uzamali_token', data.token);
    localStorage.setItem('uzamali_user', JSON.stringify(data.user));
    localStorage.setItem('uzamali_points', data.user.maliPoints.toString());
    setUser(data.user);
    setMaliPoints(data.user.maliPoints);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setMaliPoints(0);
    localStorage.removeItem('uzamali_token');
    localStorage.removeItem('uzamali_user');
    localStorage.removeItem('uzamali_points');
  };

  const addPoints = async (amount) => {
    const newPoints = maliPoints + amount;
    setMaliPoints(newPoints);
    localStorage.setItem('uzamali_points', newPoints.toString());
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, maliPoints, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
