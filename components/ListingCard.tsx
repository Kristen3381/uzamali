import Link from 'next/link';

export default function ListingCard({ listing }) {
  return (
    <div className="listing-card">
      <img src={listing.image} alt={listing.name} width="200" />
      <h3>{listing.name}</h3>
      <p>Price: KSh {listing.price}</p>
      <p>Location: {listing.location}</p>
      <p>Type: {listing.type}</p>
      <Link href={`/listings/${listing.id}`}>
        <a>View Details</a>
      </Link>
    </div>
  );
}