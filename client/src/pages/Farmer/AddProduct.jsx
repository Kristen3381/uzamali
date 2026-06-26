import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, MapPin, CheckCircle2, Leaf, Zap, HelpCircle } from 'lucide-react';
import EduPopup from '../../components/UI/EduPopup';
import { useAuth } from '../../context/AuthContext';

const AddProduct = () => {
  const { addPoints } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [activeEdu, setActiveEdu] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    price: 0,
    unit: 'kg',
    quantity: 0,
    harvestDate: '',
    location: '',
    sustainable: false
  });

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Legumes', 'Tubers', 'Dairy', 'Agro-waste', 'Other'];
  const units = ['kg', 'g', 'litre', 'piece', 'crate', 'bag', 'bundle'];

  useEffect(() => {
    if (formData.category === 'Agro-waste') {
      setActiveEdu('waste');
    }
  }, [formData.category]);

  const handleSustainableToggle = (checked) => {
    setFormData({ ...formData, sustainable: checked });
    if (checked) {
      setActiveEdu('sustainable');
    }
  };

  const calculatePoints = () => {
    if (formData.category !== 'Agro-waste') return 0;
    // Base 20 points + 2 points per kg/unit
    return 20 + (formData.quantity * 2);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 5) {
      alert('Maximum 5 images allowed.');
      return;
    }
    setUploadedImages(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const points = calculatePoints();
    if (points > 0) {
      addPoints(points);
      alert(`Listing created! You earned ${points} Mali Points for your contribution to the circular economy!`);
    } else {
      alert('Listing created successfully! Buyers near you will be notified.');
    }
  };

  const wasteEduContent = (
    <div className="space-y-4">
      <p className="font-semibold text-primary">Circular Economy: Turning Waste to Wealth</p>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">1</div>
          <p className="text-sm"><strong>Biogas:</strong> Organic waste like manure or rotting fruit can generate clean cooking gas.</p>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">2</div>
          <p className="text-sm"><strong>Briquettes:</strong> Dry stalks and husks can be compressed into smokeless charcoal alternatives.</p>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">3</div>
          <p className="text-sm"><strong>Silage:</strong> Certain green wastes can be fermented to create high-protein animal feed for the dry season.</p>
        </div>
      </div>
      <div className="mt-4 p-3 bg-primary/10 rounded-lg border-2 border-dashed border-primary/30">
        <p className="text-xs font-bold text-primary italic">"Kenya produces 8M tonnes of agri-waste annually. Selling it helps save our forests!"</p>
      </div>
    </div>
  );

  const sustainableEduContent = (
    <div className="space-y-4">
      <p className="font-semibold text-primary">What makes a product "Sustainable"?</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">By marking this product as sustainable, you confirm you use at least two of these practices:</p>
      <ul className="grid grid-cols-1 gap-2">
        <li className="flex items-center gap-2 text-sm bg-green-50 dark:bg-zinc-800 p-2 rounded-md">
          <CheckCircle2 className="w-4 h-4 text-accent" /> No synthetic chemical pesticides
        </li>
        <li className="flex items-center gap-2 text-sm bg-green-50 dark:bg-zinc-800 p-2 rounded-md">
          <CheckCircle2 className="w-4 h-4 text-accent" /> Efficient water drip irrigation
        </li>
        <li className="flex items-center gap-2 text-sm bg-green-50 dark:bg-zinc-800 p-2 rounded-md">
          <CheckCircle2 className="w-4 h-4 text-accent" /> Use of organic compost/manure
        </li>
        <li className="flex items-center gap-2 text-sm bg-green-50 dark:bg-zinc-800 p-2 rounded-md">
          <CheckCircle2 className="w-4 h-4 text-accent" /> Crop rotation for soil health
        </li>
      </ul>
      <p className="text-xs text-amber-600 font-bold bg-amber-50 p-2 rounded">
        Note: Sustainable products often sell for 15-20% higher prices on UzaMali!
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <EduPopup 
        isOpen={activeEdu === 'waste'} 
        onClose={() => setActiveEdu(null)} 
        title="Managing Agro-waste Like a Pro"
        content={wasteEduContent}
      />

      <EduPopup 
        isOpen={activeEdu === 'sustainable'} 
        onClose={() => setActiveEdu(null)} 
        title="The Sustainability Standard"
        content={sustainableEduContent}
      />

      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-accent">Add a New Product</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Fill out the form below to list your surplus produce or agro-waste on the marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card shadow-md">
          <div className="bg-primary/80 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center border-b border-white/20">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-highlight" />
              Product Information
            </h2>
            {formData.category === 'Agro-waste' && (
              <div className="flex flex-col items-end">
                <span className="bg-highlight text-black text-[10px] font-black px-2 py-1 rounded-md uppercase animate-pulse">
                  + {calculatePoints()} Mali Points
                </span>
                <span className="text-[8px] opacity-80">Based on quantity</span>
              </div>
            )}
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Product Name</label>
                <input 
                  type="text" 
                  required 
                  className="input-field"
                  placeholder="e.g., Fresh Tomatoes"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-primary dark:text-accent">Category</label>
                  <button type="button" onClick={() => setActiveEdu('waste')} className="text-primary hover:text-accent">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Description</label>
                <textarea 
                  rows="4"
                  required 
                  className="input-field"
                  placeholder="Provide a detailed description of your product..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Price (KES)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Unit</label>
                  <select 
                    className="input-field"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Quantity Available</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  className="input-field"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Harvest Date</label>
                <input 
                  type="date" 
                  required 
                  className="input-field"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required 
                    className="input-field pl-10"
                    placeholder="Enter location or use GPS"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
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
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/30 rounded-xl p-8 flex flex-col items-center justify-center bg-white/30 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-2">Max 5 images ({uploadedImages.length}/5 uploaded)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {uploadedImages.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {uploadedImages.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                    <img src={src} alt={`Upload ${i+1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(src);
                        setUploadedImages(prev => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg hover:bg-red-600"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 flex items-center gap-3 glass p-4 rounded-lg border border-white/20">
              <input 
                type="checkbox" 
                id="sustainable" 
                className="w-6 h-6 text-accent border-primary rounded focus:ring-accent accent-accent cursor-pointer"
                checked={formData.sustainable}
                onChange={(e) => handleSustainableToggle(e.target.checked)}
              />
              <div className="flex-1">
                <label htmlFor="sustainable" className="font-black text-primary dark:text-accent cursor-pointer flex items-center gap-2">
                  Mark as Sustainable
                  <button type="button" onClick={() => setActiveEdu('sustainable')}>
                    <HelpCircle className="w-3 h-3 text-gray-400" />
                  </button>
                </label>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Earns you a premium badge and 15% higher search visibility!</p>
              </div>
              <span className="badge-sustainable animate-bounce">Premium Badge</span>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full btn-primary py-4 text-xl shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
          <Zap className="w-6 h-6 fill-current text-highlight" />
          List Product for Sale
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
