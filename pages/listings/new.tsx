import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  quantity: string;
  unit: string;
  location: string;
  images: File[];
  harvestDate: string;
  organic: boolean;
  deliveryAvailable: boolean;
}

export default function NewListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    unit: 'kg',
    location: '',
    images: [],
    harvestDate: '',
    organic: false,
    deliveryAvailable: false,
  });

  const [loading, setLoading] = useState(false);
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
        images: files
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
      // TODO: Replace with actual API call to create listing
      console.log('Creating listing:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to listings page or dashboard after successful creation
      router.push('/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center text-primary hover:text-primary/80 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold text-foreground">Add New Listing</h1>
              <p className="text-muted-foreground mt-2">
                List your agricultural products for sale on Uza Mali
              </p>
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

                  <div className="flex items-center space-x-4">
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

              {/* Images */}
              <div className="card">
                <h2 className="text-xl font-semibold text-foreground mb-4">Product Images</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Upload Images (Max 5)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add clear photos of your product from different angles
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
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
                      Creating Listing...
                    </>
                  ) : (
                    'Create Listing'
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