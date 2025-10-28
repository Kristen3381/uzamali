import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  image: string;
  organic: boolean;
  deliveryAvailable: boolean;
  createdAt: string;
  status: 'active' | 'sold' | 'draft';
}

export default function ListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Mock data with working placeholder images
  const [listings, setListings] = useState<Listing[]>([
    {
      id: '1',
      title: 'Fresh Organic Tomatoes',
      description: 'Freshly harvested organic tomatoes from our farm. Perfect for cooking and salads.',
      price: 150,
      category: 'Vegetables',
      quantity: 50,
      unit: 'kg',
      location: 'Nairobi, Kiambu',
      image: 'https://images.unsplash.com/photo-1546470427-e212b7d31075?w=300&h=200&fit=crop',
      organic: true,
      deliveryAvailable: true,
      createdAt: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      title: 'Premium Avocados',
      description: 'Hass avocados, perfect for export quality. Rich and creamy texture.',
      price: 80,
      category: 'Fruits',
      quantity: 100,
      unit: 'piece',
      location: 'Muranga',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=200&fit=crop',
      organic: false,
      deliveryAvailable: true,
      createdAt: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      title: 'Organic Sweet Potatoes',
      description: 'Fresh sweet potatoes, rich in vitamins and perfect for healthy meals.',
      price: 120,
      category: 'Tubers',
      quantity: 75,
      unit: 'kg',
      location: 'Machakos',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop',
      organic: true,
      deliveryAvailable: false,
      createdAt: '2024-01-13',
      status: 'draft'
    }
  ]);

  const [filter, setFilter] = useState('all'); // all, active, sold, draft

  const filteredListings = listings.filter(listing => 
    filter === 'all' ? true : listing.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sold': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/listings/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      // TODO: Replace with actual API call
      setListings(prev => prev.filter(listing => listing.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'sold' | 'draft') => {
    // TODO: Replace with actual API call
    setListings(prev => prev.map(listing => 
      listing.id === id ? { ...listing, status: newStatus } : listing
    ));
  };

  const handleViewListing = (id: string) => {
    router.push(`/listings/${id}`);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage your product listings and track their performance
                  </p>
                </div>
                <button
                  onClick={() => router.push('/listings/new')}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Listing
                </button>
              </div>
            </div>

            {/* Stats and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                {/* Status Filters */}
                <div className="flex space-x-2">
                  {[
                    { value: 'all', label: 'All Listings', count: listings.length },
                    { value: 'active', label: 'Active', count: listings.filter(l => l.status === 'active').length },
                    { value: 'sold', label: 'Sold', count: listings.filter(l => l.status === 'sold').length },
                    { value: 'draft', label: 'Draft', count: listings.filter(l => l.status === 'draft').length },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setFilter(item.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === item.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-foreground border border-border hover:bg-accent'
                      }`}
                    >
                      {item.label} ({item.count})
                    </button>
                  ))}
                </div>

                {/* Search and Sort */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search listings..."
                    className="input w-64"
                  />
                  <select className="input">
                    <option>Sort by: Newest</option>
                    <option>Sort by: Price</option>
                    <option>Sort by: Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">
                  {filter === 'all' 
                    ? "You haven't created any listings yet."
                    : `No ${filter} listings found.`
                  }
                </p>
                {filter === 'all' && (
                  <button
                    onClick={() => router.push('/listings/new')}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Your First Listing
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div 
                      className="relative h-48 bg-gray-200 cursor-pointer"
                      onClick={() => handleViewListing(listing.id)}
                    >
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/4A5568/FFFFFF?text=${encodeURIComponent(listing.title)}`;
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 
                          className="font-semibold text-foreground text-lg line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleViewListing(listing.id)}
                        >
                          {listing.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                          {listing.description}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Price:</span>
                          <span className="font-semibold text-foreground">KSH {listing.price.toLocaleString()}/{listing.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Quantity:</span>
                          <span className="text-foreground">{listing.quantity.toLocaleString()} {listing.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Location:</span>
                          <span className="text-foreground">{listing.location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Category:</span>
                          <span className="text-foreground">{listing.category}</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {listing.organic && (
                          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs">
                            🌱 Organic
                          </span>
                        )}
                        {listing.deliveryAvailable && (
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded text-xs">
                            🚚 Delivery
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(listing.id)}
                          className="flex-1 bg-primary text-primary-foreground py-2 px-3 rounded text-sm hover:bg-primary/90 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="flex-1 bg-destructive text-destructive-foreground py-2 px-3 rounded text-sm hover:bg-destructive/90 transition-colors"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Status Actions */}
                      <div className="flex space-x-2 mt-2">
                        {listing.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'sold')}
                            className="flex-1 bg-gray-500 text-white py-1 px-2 rounded text-xs hover:bg-gray-600 transition-colors"
                          >
                            Mark as Sold
                          </button>
                        )}
                        {listing.status === 'sold' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'active')}
                            className="flex-1 bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600 transition-colors"
                          >
                            Reactivate
                          </button>
                        )}
                        {listing.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'active')}
                            className="flex-1 bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}