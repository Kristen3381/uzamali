import { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function ListingForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [type, setType] = useState('produce');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    try {
      const imageRef = ref(storage, `listings/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageURL = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'listings'), {
        name,
        price,
        image: imageURL,
        location,
        type,
        createdAt: new Date(),
        userId: user?.uid,
      });

      setName('');
      setPrice('');
      setImage(null);
      setLocation('');
    } catch (error) {
      console.error("Error adding listing: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="listing-form">
      <h2>Add New Listing</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price (KSh)"
        required
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
        required
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="produce">Produce</option>
        <option value="waste">Agro-Waste</option>
      </select>
      <button type="submit">Add Listing</button>
    </form>
  );
}