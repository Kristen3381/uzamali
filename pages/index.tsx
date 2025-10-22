import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/produce-market');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return <div>Loading...</div>;
}
