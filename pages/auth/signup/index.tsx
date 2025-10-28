import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import Layout from '../../../components/Layout';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'seller' as 'seller' | 'buyer' | 'courier',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.role);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join Uza Mali and start your journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  I want to join as a:
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { 
                      value: 'seller', 
                      label: '🌱 Seller', 
                      description: 'Sell agricultural products directly to buyers',
                      icon: '🌱'
                    },
                    { 
                      value: 'buyer', 
                      label: '🏢 Buyer', 
                      description: 'Purchase quality agricultural products',
                      icon: '🏢'
                    },
                    { 
                      value: 'courier', 
                      label: '🚚 Courier', 
                      description: 'Deliver products between sellers and buyers',
                      icon: '🚚'
                    }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.role === option.value
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:bg-accent hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={handleChange}
                        className="mt-1 text-primary focus:ring-primary border-border"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{option.icon}</span>
                          <span className="font-medium text-foreground">{option.label}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-foreground">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <a
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}