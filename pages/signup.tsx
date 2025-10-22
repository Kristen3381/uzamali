import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      console.error("Error signing up: ", error);
      setError("Failed to create an account. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <title>UzaMali - Sign Up</title>
      </Head>
      <div className="login-page-container">
        <div className="login-card-container">
          <div className="login-card">
            <div className="login-logo">
              🚜 <h1>UzaMali</h1>
            </div>
            <h2>Create an Account</h2>
            <p>Enter your details to create an account</p>
            <form onSubmit={handleSignup}>
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
              <button type="submit" className="login-button">Sign Up</button>
            </form>
            <p className="signup-link">
              Already have an account? <Link href="/login" className="signup-link-link">Log in!</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
