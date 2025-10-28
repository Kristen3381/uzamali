import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ListingCard from '../components/ListingCard';

interface Listing {
  id: string;
  name: string;
  price: number;
  image: string;
  location: string;
  type: string;
  category?: string;
  unit?: string;
  quantity?: number;
}

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const querySnapshot = await getDocs(collection(db, 'listings'));
        const listingsData: Listing[] = [];
        querySnapshot.forEach((doc) => {
          listingsData.push({ 
            id: doc.id, 
            ...doc.data() 
          } as Listing);
        });
        setListings(listingsData);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Produce</h3>
          <p className="text-2xl font-bold text-green-600">
            {listings.filter(l => l.type === 'produce').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Equipment</h3>
          <p className="text-2xl font-bold text-blue-600">
            {listings.filter(l => l.type === 'equipment').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Agro-Waste</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {listings.filter(l => l.type === 'waste').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No listings found</p>
        </div>
      )}
    </div>
  );
}