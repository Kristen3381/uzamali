import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication based on email content or role
    let role = 'buyer';
    if (email.includes('farmer')) role = 'farmer';
    if (email.includes('courier')) role = 'courier';
    if (email.includes('admin')) role = 'admin';

    const mockUser = {
      id: '1',
      name: email.split('@')[0],
      email: email,
      role: role
    };

    login(mockUser);
    
    // Redirect based on role
    if (role === 'farmer') navigate('/farmer/dashboard');
    else if (role === 'courier') navigate('/courier/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/market');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border-2 border-primary">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-primary">Uza<span className="text-highlight">Mali</span></h1>
            <p className="text-gray-600 mt-2">Welcome back! Please login to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                className="input-field"
                placeholder="e.g. farmer@uzamali.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1">*Hint: use 'farmer@...', 'courier@...', or 'admin@...' for testing roles</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">Password</label>
              <input 
                type="password" 
                required 
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3 text-lg mt-4">
              Login to Market
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? {' '}
              <Link to="/register" className="text-accent font-bold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
