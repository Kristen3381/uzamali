import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

interface Listing {
  id: string;
  name: string;
  price: number;
  image: string;
  location: string;
  type: string;
  description?: string;
  quantity?: number;
  unit?: string;
  userEmail?: string;
  createdAt?: any;
}

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchListing() {
      if (typeof id !== 'string') return;

      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setListing({ 
            id: docSnap.id, 
            ...docSnap.data() 
          } as Listing);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
          <button 
            onClick={() => router.push('/marketplace')}
            className="text-blue-500 hover:text-blue-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img 
          src={listing.image}
          alt={listing.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">{listing.name}</h1>
          <div className="flex items-center mt-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {listing.type}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-green-600">
              KSh {listing.price}
            </span>
            {listing.unit && listing.unit !== 'unit' && (
              <span className="text-lg text-gray-600"> / {listing.unit}</span>
            )}
          </div>
          <div className="mt-4 flex items-center text-gray-600">
            <span>📍 {listing.location}</span>
          </div>
          {listing.quantity && (
            <div className="mt-2">
              <span className="text-gray-700">
                {listing.quantity} {listing.unit} available
              </span>
            </div>
          )}
          {listing.userEmail && (
            <div className="mt-4">
              <span className="text-gray-900">Seller: {listing.userEmail}</span>
            </div>
          )}
          {listing.description && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{listing.description}</p>
            </div>
          )}
          {user && user.email !== listing.userEmail && (
            <button className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600">
              Contact Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}