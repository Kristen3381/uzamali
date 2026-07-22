import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Zap, MapPin, BookOpen, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EduPopup from '../../components/UI/EduPopup';
import { getProducts, imageUrl } from '../../services/productService';
import { addToCart } from '../../services/cartService';

const ProduceMarket = () => {
  const navigate = useNavigate();
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#13382E] p-4 rounded-xl border border-[#1F5243] shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3B8B0] w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search produce..." 
            className="w-full pl-10 pr-4 py-2.5 input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="text-[#E5A93B] w-5 h-5 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0B251D] text-white border border-[#1F5243] rounded-xl px-3 py-2.5 outline-none focus:border-[#E5A93B] shrink-0 text-sm font-semibold"
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
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeCategory === cat 
              ? 'bg-[#E5A93B] text-[#0B251D] shadow-md shadow-[#E5A93B]/20' 
              : 'bg-[#226351]/40 border border-[#1F5243] text-[#A3B8B0] hover:text-white hover:bg-[#226351]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#A3B8B0] text-lg font-medium">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-[#A3B8B0] text-lg font-medium">No products found</div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="card group flex flex-col h-full bg-[#13382E] border border-[#1F5243] rounded-xl overflow-hidden shadow-lg shadow-black/20 hover:border-[#226351] transition-all">
            <div className="relative h-48 overflow-hidden bg-[#0B251D]">
              <img 
                src={imageUrl(product.images?.[0]) || 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'; }}
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg text-white bg-[#226351] border border-[#1F5243] uppercase tracking-wider">
                  {product.category || 'Listed'}
                </span>
                {product.sustainable && (
                  <span className="badge-sustainable">Sustainable</span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-[#0B251D]/90 backdrop-blur-sm border border-[#1F5243] px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold text-[#A3B8B0]">
                <MapPin className="w-3.5 h-3.5 text-[#E5A93B]" />
                {product.location}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-[#A3B8B0] text-sm mb-4 line-clamp-2 italic">
                  "{product.description}"
                </p>
              </div>
              
              <div>
                <div className="mb-4">
                  <span className="text-2xl font-black text-[#E5A93B]">KES {product.price.toLocaleString()}</span>
                  <span className="text-[#A3B8B0] text-sm font-semibold"> / {product.unit}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      addToCart(product);
                      setAddedToCart(product._id);
                      setTimeout(() => setAddedToCart(null), 2000);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 font-bold rounded-xl text-sm border transition-all ${
                      addedToCart === product._id
                        ? 'border-[#226351] bg-[#226351] text-white'
                        : 'bg-[#226351]/50 border-[#1F5243] text-white hover:bg-[#226351]'
                    }`}
                  >
                    {addedToCart === product._id ? (
                      <><CheckCircle className="w-4 h-4 text-[#E5A93B]" /> Added</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4 text-[#A3B8B0]" /> Cart</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product);
                      navigate('/cart');
                    }}
                    className="btn-primary py-2.5 px-2 text-sm flex items-center justify-center gap-1"
                  >
                    <Zap className="w-4 h-4 fill-current text-[#0B251D]" />
                    Buy Now
                  </button>
                </div>
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
