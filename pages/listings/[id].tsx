import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchListing = async () => {
        const docRef = doc(db, 'listings', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing({ id: docSnap.id, ...docSnap.data() });
        }
      };
      fetchListing();
    }
  }, [id]);

  if (!listing) return <p>Loading...</p>;

  return (
    <div>
      <h1>{listing.name}</h1>
      <img src={listing.image} alt={listing.name} width="400" />
      <p>Price: KSh {listing.price}</p>
      <p>Location: {listing.location}</p>
      <p>Type: {listing.type}</p>
    </div>
  );
}