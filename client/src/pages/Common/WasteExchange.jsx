import React, { useState, useEffect } from 'react';
import { 
  Recycle, 
  Leaf, 
  Zap, 
  MapPin, 
  ShoppingCart, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  Search, 
  Filter, 
  ArrowRight, 
  Award, 
  Info, 
  Flame,
  Scale,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, imageUrl } from '../../services/productService';
import { addToCart } from '../../services/cartService';
import { useAuth } from '../../context/AuthContext';

const INITIAL_WASTE_LISTINGS = [
  {
    _id: 'waste-1',
    name: 'Dry Maize Stalks & Husks',
    title: 'Dry Maize Stalks & Husks',
    category: 'Agro-waste',
    suggestedUse: 'animal-feed',
    description: 'High-dry-matter maize stalks post-harvest. Perfect for silage, livestock fodder, or bio-briquettes.',
    price: 150,
    unit: 'bundle (40kg)',
    quantity: 450,
    location: 'Nakuru, Rongai',
    moisture: '12%',
    sustainable: true,
    sellerName: 'John Farmer',
    sellerTrustLevel: 'verified',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'],
    maliPointsEarnable: 25,
    co2SavedKg: 180,
  },
  {
    _id: 'waste-2',
    name: 'Sugarcane Bagasse Biomass',
    title: 'Sugarcane Bagasse Biomass',
    category: 'Agro-waste',
    suggestedUse: 'composting-biogas',
    description: 'Crushed sugarcane bagasse ideal for commercial biogas generation, biochar production, or paper pulp.',
    price: 1800,
    unit: 'ton',
    quantity: 25,
    location: 'Mumias, Kakamega',
    moisture: '35%',
    sustainable: true,
    sellerName: 'Western Sugarcane Outgrowers',
    sellerTrustLevel: 'verified',
    images: ['https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600'],
    maliPointsEarnable: 120,
    co2SavedKg: 850,
  },
  {
    _id: 'waste-3',
    name: 'Organic Coffee Husk Charcoal Material',
    title: 'Organic Coffee Husk Charcoal Material',
    category: 'Agro-waste',
    suggestedUse: 'composting-biogas',
    description: 'Sun-dried parchment husks from specialty Arabica coffee pulping. High calorific heat output for briquettes.',
    price: 850,
    unit: '90kg bag',
    quantity: 120,
    location: 'Nyeri, Karatina',
    moisture: '9%',
    sustainable: true,
    sellerName: 'Nyeri Farmers Co-op',
    sellerTrustLevel: 'verified',
    images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=600'],
    maliPointsEarnable: 50,
    co2SavedKg: 340,
  },
  {
    _id: 'waste-4',
    name: 'Banana Stems & Fruit Offcuts',
    title: 'Banana Stems & Fruit Offcuts',
    category: 'Agro-waste',
    suggestedUse: 'animal-feed',
    description: 'Fresh moisture-rich banana pseudo-stems for pig and cattle green feed or organic compost starter.',
    price: 350,
    unit: 'pickup load',
    quantity: 15,
    location: 'Kisumu, Kibos',
    moisture: '78%',
    sustainable: true,
    sellerName: 'Kisumu Green Produce',
    sellerTrustLevel: 'verified',
    images: ['https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80&w=600'],
    maliPointsEarnable: 30,
    co2SavedKg: 210,
  },
  {
    _id: 'waste-5',
    name: 'Poultry Manure & Wood Shavings Bedding',
    title: 'Poultry Manure & Wood Shavings Bedding',
    category: 'Agro-waste',
    suggestedUse: 'composting-biogas',
    description: 'Aged layer chicken manure mixed with wood shavings. Rich in Nitrogen and Phosphorus for direct composting.',
    price: 450,
    unit: '50kg bag',
    quantity: 200,
    location: 'Kiambu, Ruiru',
    moisture: '22%',
    sustainable: true,
    sellerName: 'Ruiru Poultry Hub',
    sellerTrustLevel: 'verified',
    images: ['https://images.unsplash.com/photo-1584473457406-6df3a637210c?auto=format&fit=crop&q=80&w=600'],
    maliPointsEarnable: 40,
    co2SavedKg: 290,
  },
  {
    _id: 'waste-6',
    name: 'Rice Husks (Fine Grain Residue)',
    title: 'Rice Husks (Fine Grain Residue)',
    category: 'Agro-waste',
    suggestedUse: 'composting-biogas',
    description: 'Dry rice husks from Mwea irrigation scheme mills. Perfect for poultry litter bedding, biochar, or boiler fuel.',
    price: 280,
    unit: '50kg bag',
    quantity: 350,
    location: 'Mwea, Kirinyaga',
    moisture: '10%',
    sustainable: true,
    sellerName: 'Mwea Rice Millers Co',
    sellerTrustLevel: 'verified',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600'],
    maliPointsEarnable: 35,
    co2SavedKg: 260,
  }
];

const WasteExchange = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeUseFilter, setActiveUseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [wasteListings, setWasteListings] = useState(INITIAL_WASTE_LISTINGS);
  const [loading, setLoading] = useState(false);
  const [addedToCartId, setAddedToCartId] = useState(null);

  // Quick Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newWaste, setNewWaste] = useState({
    name: '',
    suggestedUse: 'animal-feed',
    price: '',
    unit: '50kg bag',
    quantity: '',
    location: '',
    moisture: '15%',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Conversion Calculator State
  const [calcWasteType, setCalcWasteType] = useState('maize');
  const [calcAmount, setCalcAmount] = useState(500); // kg

  useEffect(() => {
    const fetchAgroWaste = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ category: 'Agro-waste' });
        if (data && data.length > 0) {
          const wasteProducts = data.map(item => ({
            ...item,
            suggestedUse: item.suggestedUse || 'animal-feed',
            moisture: item.moisture || '15%',
            co2SavedKg: item.co2SavedKg || Math.round((item.quantity || 10) * 1.8),
            maliPointsEarnable: Math.round((item.price || 100) * 0.1) + 10,
          }));
          setWasteListings([...wasteProducts, ...INITIAL_WASTE_LISTINGS.filter(i => !wasteProducts.some(p => p._id === i._id))]);
        }
      } catch (err) {
        console.error('Failed to load server waste listings, using regional exchange data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgroWaste();
  }, []);

  const handlePostWaste = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newWaste.name);
      formData.append('category', 'Agro-waste');
      formData.append('suggestedUse', newWaste.suggestedUse);
      formData.append('price', newWaste.price);
      formData.append('unit', newWaste.unit);
      formData.append('quantity', newWaste.quantity);
      formData.append('location', newWaste.location || user?.location || 'Nairobi');
      formData.append('description', `${newWaste.description} (Moisture Content: ${newWaste.moisture})`);
      formData.append('sustainable', 'true');

      let created;
      try {
        created = await createProduct(formData);
      } catch (apiErr) {
        console.warn('Backend API unavailable, adding locally to Waste Exchange state', apiErr);
      }

      const newEntry = {
        _id: created?._id || `local-waste-${Date.now()}`,
        name: newWaste.name,
        title: newWaste.name,
        category: 'Agro-waste',
        suggestedUse: newWaste.suggestedUse,
        description: newWaste.description,
        price: Number(newWaste.price),
        unit: newWaste.unit,
        quantity: Number(newWaste.quantity),
        location: newWaste.location || 'Local Farm',
        moisture: newWaste.moisture,
        sustainable: true,
        sellerName: user?.name || 'Local Farmer',
        sellerTrustLevel: 'verified',
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'],
        maliPointsEarnable: Math.round(Number(newWaste.price) * 0.1) + 15,
        co2SavedKg: Math.round(Number(newWaste.quantity) * 2),
      };

      setWasteListings(prev => [newEntry, ...prev]);
      setIsPostModalOpen(false);
      setNewWaste({
        name: '',
        suggestedUse: 'animal-feed',
        price: '',
        unit: '50kg bag',
        quantity: '',
        location: '',
        moisture: '15%',
        description: '',
      });
      alert('♻️ Agro-Waste Listed Successfully! Your listing is live on the Circular Waste Exchange.');
    } catch (err) {
      alert('Failed to post waste listing: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredListings = wasteListings
    .filter(item => {
      const matchSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchUse = activeUseFilter === 'all' || item.suggestedUse === activeUseFilter;
      return matchSearch && matchUse;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  // Conversion rates for waste calculator
  const conversionData = {
    maize: { name: 'Maize Stalks & Husks', biogasKwh: 0.35, compostKg: 0.7, co2SavedKg: 1.8, priceAvg: 150 },
    bagasse: { name: 'Sugarcane Bagasse', biogasKwh: 0.45, compostKg: 0.65, co2SavedKg: 2.1, priceAvg: 1800 },
    coffee: { name: 'Coffee Husks', biogasKwh: 0.50, compostKg: 0.8, co2SavedKg: 2.4, priceAvg: 850 },
    fruit: { name: 'Fruit & Veg Residue', biogasKwh: 0.28, compostKg: 0.5, co2SavedKg: 1.4, priceAvg: 350 },
    manure: { name: 'Poultry / Farm Manure', biogasKwh: 0.60, compostKg: 0.85, co2SavedKg: 2.8, priceAvg: 450 },
  };

  const selectedCalc = conversionData[calcWasteType] || conversionData.maize;
  const calcBiogas = Math.round(calcAmount * selectedCalc.biogasKwh);
  const calcCompost = Math.round(calcAmount * selectedCalc.compostKg);
  const calcCO2 = Math.round(calcAmount * selectedCalc.co2SavedKg);
  const calcMaliPts = Math.round(calcAmount * 0.15);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B251D] via-[#13382E] to-[#1F5243] p-8 border border-[#226351] shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#E5A93B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5A93B]/20 border border-[#E5A93B]/40 text-[#E5A93B] text-xs font-black uppercase tracking-wider">
              <Recycle className="w-4 h-4 animate-spin-slow" />
              Circular Economy Hub
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              Uzamali Waste Exchange Platform
            </h1>
            <p className="text-[#A3B8B0] text-sm lg:text-base leading-relaxed">
              Monetize agricultural crop residue, husks, and manure. Connect with verified buyers for animal feed, biogas generation, biomass briquettes, and bio-fertilizer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#E5A93B] hover:bg-[#d4982a] text-[#0B251D] font-bold text-sm shadow-lg shadow-[#E5A93B]/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              List Agro-Waste
            </button>
            <button 
              onClick={() => navigate('/pricing-tool')}
              className="px-5 py-3 rounded-xl bg-[#226351]/60 hover:bg-[#226351] border border-[#1F5243] text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Scale className="w-5 h-5 text-[#E5A93B]" />
              Check Waste Valuations
            </button>
          </div>
        </div>

        {/* Circular Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#1F5243]">
          <div className="p-3 bg-[#0B251D]/60 rounded-xl border border-[#1F5243]">
            <p className="text-xs text-[#A3B8B0] font-semibold">Total Waste Diverted</p>
            <p className="text-xl font-black text-[#E5A93B] mt-0.5">148.5 Tons</p>
          </div>
          <div className="p-3 bg-[#0B251D]/60 rounded-xl border border-[#1F5243]">
            <p className="text-xs text-[#A3B8B0] font-semibold">Carbon Footprint Saved</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">312.4 Tons CO₂e</p>
          </div>
          <div className="p-3 bg-[#0B251D]/60 rounded-xl border border-[#1F5243]">
            <p className="text-xs text-[#A3B8B0] font-semibold">Mali Eco-Points Rewarded</p>
            <p className="text-xl font-black text-yellow-400 mt-0.5">24,500 Pts</p>
          </div>
          <div className="p-3 bg-[#0B251D]/60 rounded-xl border border-[#1F5243]">
            <p className="text-xs text-[#A3B8B0] font-semibold">Active Bio-Trade Partners</p>
            <p className="text-xl font-black text-white mt-0.5">380+ Verifiers</p>
          </div>
        </div>
      </div>

      {/* Intended Application Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#E5A93B]" />
              Explore Available Waste Listings
            </h2>
            <p className="text-xs text-[#A3B8B0]">Filtered by verified commercial applications and quality specifications</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3B8B0] w-4 h-4" />
              <input
                type="text"
                placeholder="Search husks, stalks, bagasse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#13382E] border border-[#1F5243] rounded-xl text-xs text-white placeholder-[#A3B8B0] focus:outline-none focus:border-[#E5A93B]"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#13382E] text-white border border-[#1F5243] rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All Agro-Waste', icon: Recycle },
            { id: 'animal-feed', label: 'Animal Feed & Silage', icon: Leaf },
            { id: 'composting-biogas', label: 'Biogas & Composting', icon: Zap },
            { id: 'heavy-discount-resale', label: 'Biomass & Briquettes', icon: Flame },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveUseFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                activeUseFilter === tab.id
                  ? 'bg-[#E5A93B] text-[#0B251D] shadow-md'
                  : 'bg-[#13382E] border border-[#1F5243] text-[#A3B8B0] hover:text-white hover:bg-[#226351]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Waste Listings */}
      {loading ? (
        <div className="text-center py-16 text-[#A3B8B0] font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E5A93B]" />
          Loading waste listings...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-[#13382E] border border-[#1F5243] rounded-2xl p-8">
          <Info className="w-10 h-10 text-[#E5A93B] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Agro-Waste Found</h3>
          <p className="text-xs text-[#A3B8B0] max-w-md mx-auto mb-4">
            There are no waste listings matching "{searchTerm}". Try clearing your search or list your own agricultural waste!
          </p>
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> List Agro-Waste Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div 
              key={item._id}
              className="bg-[#13382E] border border-[#1F5243] rounded-2xl overflow-hidden shadow-xl hover:border-[#226351] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 bg-[#0B251D] overflow-hidden">
                  <img 
                    src={imageUrl(item.images?.[0]) || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'; }}
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg text-white bg-[#0B251D]/90 border border-[#1F5243] uppercase tracking-wider backdrop-blur-sm">
                      {item.suggestedUse === 'animal-feed' ? '🌾 Animal Feed' :
                       item.suggestedUse === 'composting-biogas' ? '⚡ Biogas / Compost' : '🔥 Biomass Briquettes'}
                    </span>
                    {item.sustainable && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Eco-Verified
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#0B251D]/90 backdrop-blur-sm border border-[#1F5243] px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#E5A93B]">
                    Moisture: {item.moisture}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-[#A3B8B0] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E5A93B]" />
                        {item.location}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#A3B8B0] leading-relaxed line-clamp-2 italic">
                    "{item.description}"
                  </p>

                  <div className="p-3 bg-[#0B251D]/60 rounded-xl border border-[#1F5243]/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#A3B8B0]">Seller: </span>
                      <span className="font-bold text-white">{item.sellerName || 'Verified Farmer'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      +{item.maliPointsEarnable} Mali Pts
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-[#E5A93B]">KES {item.price.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-[#A3B8B0]"> / {item.unit}</span>
                  </div>
                  <span className="text-xs text-[#A3B8B0] font-semibold">Available: {item.quantity} {item.unit}s</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      addToCart(item);
                      setAddedToCartId(item._id);
                      setTimeout(() => setAddedToCartId(null), 2000);
                    }}
                    className={`py-2.5 px-3 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      addedToCartId === item._id
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-[#226351]/40 border-[#1F5243] text-white hover:bg-[#226351]'
                    }`}
                  >
                    {addedToCartId === item._id ? (
                      <><CheckCircle2 className="w-4 h-4 text-emerald-300" /> In Cart</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4 text-[#A3B8B0]" /> Add to Cart</>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      addToCart(item);
                      navigate('/cart');
                    }}
                    className="btn-primary py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    Buy Waste
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Circular Value Conversion & Yield Calculator */}
      <div className="bg-[#13382E] border border-[#1F5243] rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F5243] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5A93B] uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              Circular Waste Yield Estimator
            </div>
            <h2 className="text-xl font-bold text-white">Commercial Conversion Calculator</h2>
            <p className="text-xs text-[#A3B8B0]">Calculate energy potential, biogas output, and compost yield from crop waste.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#A3B8B0] uppercase mb-2">Select Agro-Waste Type</label>
              <select
                value={calcWasteType}
                onChange={(e) => setCalcWasteType(e.target.value)}
                className="w-full bg-[#0B251D] border border-[#1F5243] text-white rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-[#E5A93B]"
              >
                <option value="maize">Maize Stalks & Husks</option>
                <option value="bagasse">Sugarcane Bagasse</option>
                <option value="coffee">Coffee Husks</option>
                <option value="fruit">Fruit & Vegetable Residue</option>
                <option value="manure">Poultry & Cattle Manure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A3B8B0] uppercase mb-2">
                Quantity (Kg): <span className="text-[#E5A93B] font-black text-sm">{calcAmount} kg</span>
              </label>
              <input 
                type="range" 
                min="50" 
                max="5000" 
                step="50"
                value={calcAmount} 
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full accent-[#E5A93B]"
              />
              <div className="flex justify-between text-[11px] text-[#A3B8B0] mt-1 font-semibold">
                <span>50 kg</span>
                <span>2.5 Tons</span>
                <span>5.0 Tons</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] text-center">
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-[#A3B8B0] font-semibold">Biogas Energy</p>
              <p className="text-xl font-black text-white mt-1">{calcBiogas} kWh</p>
              <p className="text-[10px] text-[#A3B8B0] mt-0.5">Electricity equivalent</p>
            </div>

            <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] text-center">
              <Leaf className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-[#A3B8B0] font-semibold">Organic Compost</p>
              <p className="text-xl font-black text-[#E5A93B] mt-1">{calcCompost} kg</p>
              <p className="text-[10px] text-[#A3B8B0] mt-0.5">Bio-fertilizer yield</p>
            </div>

            <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] text-center">
              <Award className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-[#A3B8B0] font-semibold">CO₂ Avoided</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{calcCO2} kg</p>
              <p className="text-[10px] text-[#A3B8B0] mt-0.5">Emissions reduced</p>
            </div>

            <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] text-center">
              <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs text-[#A3B8B0] font-semibold">Mali Eco-Points</p>
              <p className="text-xl font-black text-yellow-400 mt-1">+{calcMaliPts}</p>
              <p className="text-[10px] text-[#A3B8B0] mt-0.5">Farmer rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Quick Post Waste */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13382E] border border-[#1F5243] w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1F5243] pb-4">
              <div className="flex items-center gap-2 text-[#E5A93B] font-bold text-lg">
                <Recycle className="w-5 h-5" />
                List Agro-Waste for Exchange
              </div>
              <button 
                onClick={() => setIsPostModalOpen(false)}
                className="text-[#A3B8B0] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostWaste} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Waste Title / Commodity Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Maize Stalks, Bagasse, Coffee Husks"
                  value={newWaste.name}
                  onChange={(e) => setNewWaste({ ...newWaste, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Intended Application</label>
                  <select
                    value={newWaste.suggestedUse}
                    onChange={(e) => setNewWaste({ ...newWaste, suggestedUse: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="animal-feed">Animal Feed & Silage</option>
                    <option value="composting-biogas">Biogas & Composting</option>
                    <option value="heavy-discount-resale">Biomass & Briquettes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Estimated Moisture %</label>
                  <select
                    value={newWaste.moisture}
                    onChange={(e) => setNewWaste({ ...newWaste, moisture: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="8%">Below 10% (Sun-Dried)</option>
                    <option value="15%">10% - 20% (Low Moisture)</option>
                    <option value="35%">20% - 40% (Medium Moisture)</option>
                    <option value="70%">Above 50% (High Green Moisture)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Asking Price (KES)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="150"
                    value={newWaste.price}
                    onChange={(e) => setNewWaste({ ...newWaste, price: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Trading Unit</label>
                  <select
                    value={newWaste.unit}
                    onChange={(e) => setNewWaste({ ...newWaste, unit: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="50kg bag">50kg bag</option>
                    <option value="90kg bag">90kg bag</option>
                    <option value="bundle (40kg)">bundle (40kg)</option>
                    <option value="ton">ton</option>
                    <option value="pickup load">pickup load</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Total Quantity</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="100"
                    value={newWaste.quantity}
                    onChange={(e) => setNewWaste({ ...newWaste, quantity: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">County / Sub-County Location</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Nakuru, Rongai"
                  value={newWaste.location}
                  onChange={(e) => setNewWaste({ ...newWaste, location: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">Description & Quality Notes</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Describe farm origin, storage conditions, and availability..."
                  value={newWaste.description}
                  onChange={(e) => setNewWaste({ ...newWaste, description: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1F5243]">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#1F5243] text-[#A3B8B0] hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
                >
                  {submitting ? 'Publishing...' : 'Publish Waste Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteExchange;
