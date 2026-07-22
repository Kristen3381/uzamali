import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B251D]">
      <div className="max-w-md w-full bg-[#13382E] border border-[#1F5243] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-[#226351] text-[#E5A93B] p-3 rounded-2xl border border-[#1F5243] mb-3">
              <Leaf className="w-8 h-8 fill-[#E5A93B]" />
            </div>
            <h1 className="text-3xl font-black text-white">Uza<span className="text-[#E5A93B]">Mali</span></h1>
            <p className="text-[#A3B8B0] text-sm mt-1">Welcome back! Sign in to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Email Address</label>
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
              <label className="block text-sm font-bold text-white mb-2">Password</label>
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
              className="w-full btn-primary py-3 text-base mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Logging in...' : 'Sign In to Market'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#1F5243] pt-6">
            <p className="text-sm text-[#A3B8B0]">
              Don't have an account? {' '}
              <Link to="/register" className="text-[#E5A93B] font-bold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

