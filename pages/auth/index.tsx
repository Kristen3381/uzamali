import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

export default function AuthIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    } else if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-64">
        <p>Redirecting...</p>
      </div>
    </Layout>
  );
}