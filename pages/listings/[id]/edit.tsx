import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Layout from '../../../components/Layout';

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  quantity: string;
  unit: string;
  location: string;
  images: File[];
  existingImages: string[];
  harvestDate: string;
  organic: boolean;
  deliveryAvailable: boolean;
  status: 'active' | 'sold' | 'draft';
}

// Initial form data with all properties defined
const initialFormData: ListingFormData = {
  title: '',
  description: '',
  price: '',
  category: '',
  quantity: '',
  unit: 'kg',
  location: '',
  images: [],
  existingImages: [],
  harvestDate: '',
  organic: false,
  deliveryAvailable: false,
  status: 'active',
};

export default function EditListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    'Vegetables',
    'Fruits',
    'Grains & Cereals',
    'Livestock',
    'Dairy',
    'Herbs & Spices',
    'Tubers',
    'Legumes',
    'Other'
  ];

  const units = ['kg', 'g', 'lb', 'oz', 'piece', 'bunch', 'bag', 'crate'];

  // Fetch listing data when component mounts
  useEffect(() => {
    if (id) {
      fetchListingData();
    }
  }, [id]);

  const fetchListingData = async () => {
    try {
      setFetchLoading(true);
      // TODO: Replace with actual API call to fetch listing by ID
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockListing = {
        id: id as string,
        title: 'Fresh Organic Tomatoes',
        description: 'Freshly harvested organic tomatoes from our farm. Grown without pesticides and chemicals.',
        price: '150',
        category: 'Vegetables',
        quantity: '50',
        unit: 'kg',
        location: 'Nairobi, Kiambu',
        existingImages: ['https://images.unsplash.com/photo-1546470427-e212b7d31075?w=300&h=200&fit=crop'],
        harvestDate: '2024-01-15',
        organic: true,
        deliveryAvailable: true,
        status: 'active' as const,
        images: [] as File[],
      };

      setFormData(mockListing);
    } catch (err: any) {
      setError('Failed to load listing data');
      console.error('Error fetching listing:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...files]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title || !formData.price || !formData.category || !formData.quantity) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call to update listing
      console.log('Updating listing:', { id, ...formData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to listings page after successful update
      router.push('/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to update listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: (prev.existingImages || []).filter((_, i) => i !== index)
    }));
  };

  const handleDeleteListing = async () => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to delete listing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to listings page after successful deletion
        router.push('/listings');
      } catch (err: any) {
        setError('Failed to delete listing. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (fetchLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-foreground">Loading listing data...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/listings')}
                className="flex items-center text-primary hover:text-primary/80 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Listings
              </button>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Edit Listing</h1>
                  <p className="text-muted-foreground mt-2">
                    Update your product listing information
                  </p>
                </div>
                <button
                  onClick={handleDeleteListing}
                  disabled={loading}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                >
                  Delete Listing
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="card">
                <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                      Product Title *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      className="input"
                      placeholder="e.g., Fresh Organic Tomatoes"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="input resize-none"
                      placeholder="Describe your product, quality, growing methods, etc."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        className="input"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="harvestDate" className="block text-sm font-medium text-foreground mb-2">
                        Harvest Date
                      </label>
                      <input
                        id="harvestDate"
                        name="harvestDate"
                        type="date"
                        className="input"
                        value={formData.harvestDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Quantity */}
              <div className="card">
                <h2 className="text-xl font-semibold text-foreground mb-4">Pricing & Quantity</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                      Price (KSH) *
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="input"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-2">
                      Quantity *
                    </label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      className="input"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-foreground mb-2">
                      Unit *
                    </label>
                    <select
                      id="unit"
                      name="unit"
                      required
                      className="input"
                      value={formData.unit}
                      onChange={handleChange}
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & Delivery */}
              <div className="card">
                <h2 className="text-xl font-semibold text-foreground mb-4">Location & Delivery</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                      Location *
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      className="input"
                      placeholder="e.g., Nairobi, Kiambu County"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="deliveryAvailable"
                        checked={formData.deliveryAvailable}
                        onChange={handleChange}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-foreground">I can arrange delivery</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="organic"
                        checked={formData.organic}
                        onChange={handleChange}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-foreground">Organic product</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="card">
                <h2 className="text-xl font-semibold text-foreground mb-4">Listing Status</h2>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                    Current Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="sold">Sold Out</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set to "Sold Out" when you no longer have this product available
                  </p>
                </div>
              </div>

              {/* Images */}
              <div className="card">
                <h2 className="text-xl font-semibold text-foreground mb-4">Product Images</h2>
                
                <div className="space-y-6">
                  {/* Existing Images */}
                  {(formData.existingImages && formData.existingImages.length > 0) && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Current Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.existingImages.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Existing image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://via.placeholder.com/150/4A5568/FFFFFF?text=Image+${index + 1}`;
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Upload */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Add New Images</h3>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Upload Additional Images
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Add more photos of your product (Max 5 additional images)
                      </p>
                    </div>

                    {(formData.images && formData.images.length > 0) && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-foreground mb-2">New Images to Add:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/listings')}
                  className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Listing...
                    </>
                  ) : (
                    'Update Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}