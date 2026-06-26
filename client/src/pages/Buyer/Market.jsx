import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Zap, MapPin, BookOpen, CheckCircle } from 'lucide-react';
import EduPopup from '../../components/UI/EduPopup';
import { getProducts, imageUrl } from '../../services/productService';

const ProduceMarket = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isEduOpen, setIsEduOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Legumes', 'Tubers', 'Dairy', 'Agro-waste'];

  useEffect(() => {
    if (activeCategory === 'Agro-waste') {
      setIsEduOpen(true);
    }
  }, [activeCategory]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        console.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProducts = products
    .filter(p => 
      (activeCategory === 'All' || p.category === activeCategory) &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        default: return 0;
      }
    });

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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-lg shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search produce..." 
            className="w-full pl-10 pr-4 py-2 input-field rounded-md focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="text-primary dark:text-accent w-5 h-5 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass rounded-md px-3 py-2 outline-none focus:border-primary shrink-0"
          >
            <option value="newest">Sort by: Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
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
              : 'glass text-primary dark:text-accent hover:bg-white/40 dark:hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-lg">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-lg">No products found</div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="card group flex flex-col h-full border-primary/20 dark:border-primary/30">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={imageUrl(product.images?.[0]) || 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'; }}
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="text-[10px] font-bold px-2 py-1 rounded-md text-white bg-primary">
                  Listed
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
                <button
                  onClick={() => {
                    setAddedToCart(product._id);
                    setTimeout(() => setAddedToCart(null), 2000);
                  }}
                  className={`flex items-center justify-center gap-1 py-2 px-2 border-2 font-bold rounded-md text-sm transition-all ${
                    addedToCart === product._id
                      ? 'border-accent bg-accent text-white'
                      : 'border-primary text-primary dark:text-accent hover:bg-primary-light dark:hover:bg-primary/10'
                  }`}
                >
                  {addedToCart === product._id ? (
                    <><CheckCircle className="w-4 h-4" /> Added</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4" /> Cart</>
                  )}
                </button>
                <button
                  onClick={() => alert(`🛒 Proceeding to checkout for ${product.name} - KES ${product.price}/${product.unit}`)}
                  className="btn-highlight flex items-center justify-center gap-1 py-2 px-2 text-sm"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default ProduceMarket;
