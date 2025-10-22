import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import ListingCard from '../components/ListingCard';
import ListingForm from '../components/ListingForm';
import { useAuth } from '../context/AuthContext';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'listings'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listingsData = [];
      querySnapshot.forEach((doc) => {
        listingsData.push({ id: doc.id, ...doc.data() });
      });
      setListings(listingsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Marketplace</h1>
      {user && <ListingForm />}
      <div className="listings-container">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}