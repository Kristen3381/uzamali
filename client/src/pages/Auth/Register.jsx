import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Tractor, Truck, ShoppingBag } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'buyer',
    password: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
    
    if (formData.role === 'farmer') navigate('/farmer/dashboard');
    else if (formData.role === 'courier') navigate('/courier/dashboard');
    else navigate('/market');
  };

  const roles = [
    { id: 'farmer', label: 'Farmer', icon: Tractor, desc: 'List surplus produce' },
    { id: 'buyer', label: 'Buyer', icon: ShoppingBag, desc: 'Purchase fresh goods' },
    { id: 'courier', label: 'Courier', icon: Truck, desc: 'Deliver products' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl overflow-hidden border-2 border-primary">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Uza<span className="text-highlight">Mali</span></h1>
            <p className="text-gray-600 mt-2">Create your account to join the agricultural revolution.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field"
                    placeholder="e.g. John Doe"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="input-field"
                    placeholder="john@example.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Phone Number (M-Pesa)</label>
                  <input 
                    type="tel" 
                    required 
                    className="input-field"
                    placeholder="2547XXXXXXXX"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Password</label>
                  <input 
                    type="password" 
                    required 
                    className="input-field"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-primary">Select Your Role</label>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map((role) => (
                    <div 
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.role === role.id 
                        ? 'border-accent bg-accent bg-opacity-10 shadow-md' 
                        : 'border-gray-200 hover:border-accent hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${formData.role === role.id ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <role.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary">{role.label}</h3>
                        <p className="text-xs text-gray-500">{role.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3 text-lg">
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? {' '}
              <Link to="/login" className="text-accent font-bold hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
