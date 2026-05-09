import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Zap, MapPin, BookOpen } from 'lucide-react';
import EduPopup from '../../components/UI/EduPopup';

const ProduceMarket = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEduOpen, setIsEduOpen] = useState(false);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Legumes', 'Tubers', 'Dairy', 'Agro-waste'];

  useEffect(() => {
    if (activeCategory === 'Agro-waste') {
      setIsEduOpen(true);
    }
  }, [activeCategory]);

  const products = [
    {
      id: 1,
      name: 'Fresh Red Tomatoes',
      category: 'Vegetables',
      description: 'Organic vine-ripened tomatoes from Kinangop. Perfect for salads and sauces.',
      price: 50,
      unit: 'kg',
      sellerType: 'Individual',
      sustainable: true,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400',
      quantity: 100,
      location: 'Kinangop, Nyandarua'
    },
    {
      id: 2,
      name: 'Organic Maize Grains',
      category: 'Grains',
      description: 'High-quality dried maize grains. Harvested last month.',
      price: 3200,
      unit: '90kg bag',
      sellerType: 'Group Sell',
      sustainable: false,
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400',
      quantity: 50,
      location: 'Kitale, Trans-Nzoia'
    },
    {
      id: 3,
      name: 'Hass Avocados',
      category: 'Fruits',
      description: 'Grade A Hass avocados. Rich in nutrients and creamy texture.',
      price: 25,
      unit: 'piece',
      sellerType: 'Individual',
      sustainable: true,
      image: 'https://images.unsplash.com/photo-1523038823543-30f00b3f61e8?auto=format&fit=crop&q=80&w=400',
      quantity: 500,
      location: 'Murang\'a'
    },
    {
      id: 4,
      name: 'Sweet Potatoes (Yellow)',
      category: 'Tubers',
      description: 'Naturally grown yellow sweet potatoes. Very sweet and healthy.',
      price: 80,
      unit: 'kg',
      sellerType: 'Individual',
      sustainable: true,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
      quantity: 200,
      location: 'Kabondo, Homa Bay'
    },
    {
      id: 5,
      name: 'Dried Maize Stalks',
      category: 'Agro-waste',
      description: 'Excellent for mulch or animal bedding. High carbon content.',
      price: 150,
      unit: 'bundle',
      sellerType: 'Individual',
      sustainable: true,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400',
      quantity: 1000,
      location: 'Nakuru'
    }
  ];

  const filteredProducts = products.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const buyerEduContent = (
    <div className="space-y-4">
      <p className="font-semibold text-primary">Why buy Agro-waste?</p>
      <div className="grid grid-cols-1 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border-l-4 border-accent">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Eco-Friendly Gardening</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Use organic waste as mulch to retain soil moisture and suppress weeds.</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border-l-4 border-accent">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Cost-Effective Fodder</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Save money by purchasing nutrient-rich stalks and husks for your livestock.</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border-l-4 border-accent">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Support Sustainability</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Help farmers reduce waste and earn Mali Points for a greener Kenya!</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <EduPopup 
        isOpen={isEduOpen} 
        onClose={() => setIsEduOpen(false)} 
        title="The Value of Agro-waste"
        content={buyerEduContent}
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search produce..." 
            className="w-full pl-10 pr-4 py-2 border-2 border-primary-light dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="text-primary dark:text-accent w-5 h-5 shrink-0" />
          <select className="bg-white dark:bg-zinc-800 dark:text-white border-2 border-primary-light dark:border-zinc-700 rounded-md px-3 py-2 outline-none focus:border-primary shrink-0 transition-colors">
            <option>Sort by: Newest First</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Nearest First</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-white dark:bg-zinc-800 text-primary dark:text-accent border-2 border-primary dark:border-primary/50 hover:bg-primary-light dark:hover:bg-primary/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card group flex flex-col h-full border-primary/20 dark:border-primary/30">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md text-white ${product.sellerType === 'Group Sell' ? 'bg-blue-600' : 'bg-primary'}`}>
                  {product.sellerType}
                </span>
                {product.sustainable && (
                  <span className="badge-sustainable">Sustainable</span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold text-gray-700 dark:text-gray-200 transition-colors">
                <MapPin className="w-3 h-3 text-red-500" />
                {product.location}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-primary dark:text-accent mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1 italic transition-colors">
                "{product.description}"
              </p>
              
              <div className="mb-4">
                <span className="text-2xl font-black text-primary dark:text-accent">KES {product.price.toLocaleString()}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold"> / {product.unit}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button className="flex items-center justify-center gap-1 py-2 px-2 border-2 border-primary text-primary dark:text-accent font-bold rounded-md hover:bg-primary-light dark:hover:bg-primary/10 transition-colors text-sm">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </button>
                <button className="btn-highlight flex items-center justify-center gap-1 py-2 px-2 text-sm">
                  <Zap className="w-4 h-4 fill-current" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProduceMarket;
