import React, { useState } from 'react';
import { Upload, Camera, MapPin, CheckCircle2 } from 'lucide-react';

const AddProduct = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product Data:', formData);
    alert('Listing created successfully! Buyers near you will be notified.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Add a New Product</h1>
        <p className="text-gray-600 mt-1">Fill out the form below to list your surplus produce or agro-waste on the marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-md border-2 border-primary-light overflow-hidden">
          <div className="bg-primary text-white px-6 py-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-highlight" />
              Product Information
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-2">Product Name</label>
                <input 
                  type="text" 
                  required 
                  className="input-field"
                  placeholder="e.g., Fresh Tomatoes"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">Category</label>
                <select 
                  className="input-field"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">Description</label>
                <textarea 
                  rows="4"
                  required 
                  className="input-field"
                  placeholder="Provide a detailed description of your product..."
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Price (KES)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="input-field"
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Unit</label>
                  <select 
                    className="input-field"
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">Quantity Available</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  className="input-field"
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">Harvest Date</label>
                <input 
                  type="date" 
                  required 
                  className="input-field"
                  onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required 
                    className="input-field pl-10"
                    placeholder="Enter location or use GPS"
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-primary-light overflow-hidden">
          <div className="bg-primary text-white px-6 py-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-highlight" />
              Product Images
            </h2>
          </div>
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-2">Max 5 images (JPG, PNG, WEBP)</p>
            </div>
            
            <div className="mt-8 flex items-center gap-3 bg-primary-light p-4 rounded-lg">
              <input 
                type="checkbox" 
                id="sustainable" 
                className="w-5 h-5 text-accent border-primary rounded focus:ring-accent"
                onChange={(e) => setFormData({...formData, sustainable: e.target.checked})}
              />
              <label htmlFor="sustainable" className="font-bold text-primary cursor-pointer">
                Mark as Sustainable
              </label>
              <span className="text-xs text-gray-500 italic ml-auto">
                Earns you a badge and higher ranking!
              </span>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full btn-primary py-4 text-xl shadow-lg hover:scale-[1.01] transition-all">
          List Product for Sale
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
