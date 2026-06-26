import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Camera, MapPin, CheckCircle2, Zap, HelpCircle } from 'lucide-react';
import EduPopup from '../../components/UI/EduPopup';
import { getProduct, updateProduct } from '../../services/productService';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeEdu, setActiveEdu] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [keepImages, setKeepImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    price: 0,
    unit: 'kg',
    quantity: 0,
    harvestDate: '',
    location: '',
    sustainable: false,
  });

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Legumes', 'Tubers', 'Dairy', 'Agro-waste', 'Other'];
  const units = ['kg', 'g', 'litre', 'piece', 'crate', 'bag', 'bundle'];

  useEffect(() => {
    const load = async () => {
      try {
        const product = await getProduct(id);
        setFormData({
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          unit: product.unit,
          quantity: product.quantity,
          harvestDate: product.harvestDate?.split('T')[0] || '',
          location: product.location,
          sustainable: product.sustainable,
        });
        setKeepImages(product.images || []);
      } catch {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (formData.category === 'Agro-waste') setActiveEdu('waste');
  }, [formData.category]);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedFiles.length > 5) {
      alert('Maximum 5 images allowed.');
      return;
    }
    setUploadedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => fd.append(key, val));
      fd.append('keepImages', JSON.stringify(keepImages));
      uploadedFiles.forEach((f) => fd.append('images', f));

      await updateProduct(id, fd);
      navigate('/farmer/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-lg">Loading...</div>;
  }

  if (error && !formData.name) {
    return <div className="text-center py-20 text-red-400 text-lg">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <EduPopup isOpen={activeEdu === 'waste'} onClose={() => setActiveEdu(null)}
        title="Managing Agro-waste Like a Pro"
        content={<p>Educational content about agro-waste</p>}
      />
      <EduPopup isOpen={activeEdu === 'sustainable'} onClose={() => setActiveEdu(null)}
        title="The Sustainability Standard"
        content={<p>Educational content about sustainability</p>}
      />

      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-accent">Edit Product</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Update your product listing details.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card shadow-md">
          <div className="bg-primary/80 backdrop-blur-md text-white px-6 py-4 border-b border-white/20">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-highlight" />
              Product Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Product Name</label>
                <input type="text" required className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Category</label>
                <select className="input-field" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Description</label>
                <textarea rows="4" required className="input-field"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Price (KES)</label>
                  <input type="number" required min="0" className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Unit</label>
                  <select className="input-field" value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    {units.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Quantity</label>
                <input type="number" required min="1" className="input-field"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Harvest Date</label>
                <input type="date" required className="input-field"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" required className="input-field pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-md">
          <div className="bg-primary/80 backdrop-blur-md text-white px-6 py-4 border-b border-white/20">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-highlight" />
              Product Images
            </h2>
          </div>
          <div className="p-6">
            {keepImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500 mb-2">Current Images</p>
                <div className="flex gap-2 flex-wrap">
                  {keepImages.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                      <img src={img} alt={`Current ${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setKeepImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg"
                      >x</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/30 rounded-xl p-8 flex flex-col items-center justify-center bg-white/30 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold">Click to add new images</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>
            {previews.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                    <img src={src} alt={`New ${i}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                      URL.revokeObjectURL(src);
                      setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i));
                      setPreviews((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                      className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg"
                    >x</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 flex items-center gap-3 glass p-4 rounded-lg border border-white/20">
              <input type="checkbox" id="sustainable" className="w-6 h-6 accent-accent cursor-pointer"
                checked={formData.sustainable}
                onChange={(e) => {
                  setFormData({ ...formData, sustainable: e.target.checked });
                  if (e.target.checked) setActiveEdu('sustainable');
                }}
              />
              <label htmlFor="sustainable" className="font-black text-primary dark:text-accent cursor-pointer">
                Mark as Sustainable
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={submitting}
            className="flex-1 btn-primary py-4 text-lg shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/farmer/products')}
            className="px-8 py-4 border border-white/30 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-white/20 font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
