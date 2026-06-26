import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'farmer') navigate('/farmer/dashboard');
      else if (user.role === 'courier') navigate('/courier/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/market');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-primary dark:text-accent">Uza<span className="text-highlight">Mali</span></h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Please login to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="e.g. farmer@uzamali.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 text-lg mt-4 shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Logging in...' : 'Login to Market'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
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
