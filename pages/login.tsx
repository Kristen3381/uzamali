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
      <div className="login-page-container">
        <div className="login-card-container">
          <div className="login-card">
            <div className="login-logo">
              🚜 <h1>UzaMali</h1>
            </div>
            <h2>Welcome Back!</h2>
            <p>Enter your credentials to access your account</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@uzamali.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="login-button">Log In</button>
            </form>
            <p className="signup-link">
              Don't have an account? <Link href="/signup" className="signup-link-link">Sign up!</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
