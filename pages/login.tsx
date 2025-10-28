import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Login() {
  const [email, setEmail] = useState('farmer@uzamali.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Failed to log in. Please check your email and password.");
    }
  };

  return (
    <>
      <Head>
        <title>UzaMali - Login</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-everglade">
        <div className="w-full max-w-md px-5">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center text-white shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center mb-4 text-lightning-yellow text-2xl">
              <span className="text-3xl">🚜</span>
              <h1 className="ml-3 font-bold text-2xl">UzaMali</h1>
            </div>
            
            <h2 className="text-white text-xl font-semibold mb-2">Welcome Back!</h2>
            <p className="text-white/80 mb-6">Enter your credentials to access your account</p>
            
            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="text-left mb-4">
                <label className="block text-white text-sm mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@uzamali.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-lightning-yellow focus:border-transparent transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="text-left mb-6">
                <label className="block text-white text-sm mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-lightning-yellow focus:border-transparent transition-colors"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button 
                type="submit" 
                className="w-full bg-lightning-yellow text-everglade font-bold py-3.5 rounded-lg hover:bg-lemon-ginger transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lightning-yellow focus:ring-offset-2 focus:ring-offset-everglade"
              >
                Log In
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-white/80 text-sm">
              Don't have an account?{" "}
              <Link 
                href="/signup" 
                className="text-lightning-yellow font-bold hover:text-lemon-ginger hover:underline transition-colors"
              >
                Sign up!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}