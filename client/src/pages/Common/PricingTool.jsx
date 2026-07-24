import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  MapPin, 
  Sparkles, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  RefreshCw,
  Share2,
  Tag
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const MARKET_BENCHMARKS = {
  // Fresh Produce
  'Tomatoes': { 
    type: 'produce',
    baseRate: 48, 
    unit: 'kg', 
    trend: 'up', 
    trendPercent: '+5.4%', 
    confidence: '96%',
    verifiedTrades: 214,
    gradeMultipliers: { 'Grade A (Premium)': 1.15, 'Grade B (Standard)': 1.0, 'Grade C (Processing)': 0.82 },
    historical: [
      { month: 'Feb', rate: 40, fairFloor: 38 },
      { month: 'Mar', rate: 42, fairFloor: 39 },
      { month: 'Apr', rate: 41, fairFloor: 40 },
      { month: 'May', rate: 44, fairFloor: 41 },
      { month: 'Jun', rate: 46, fairFloor: 43 },
      { month: 'Jul', rate: 48, fairFloor: 44 },
    ],
    regional: { 'Nairobi': 52, 'Nakuru': 44, 'Eldoret': 42, 'Kisumu': 49, 'Nyeri': 46 }
  },
  'Maize': { 
    type: 'produce',
    baseRate: 3200, 
    unit: '90kg bag', 
    trend: 'down', 
    trendPercent: '-2.1%', 
    confidence: '98%',
    verifiedTrades: 410,
    gradeMultipliers: { 'Grade A (Premium)': 1.08, 'Grade B (Standard)': 1.0, 'Grade C (Feed Grade)': 0.88 },
    historical: [
      { month: 'Feb', rate: 3500, fairFloor: 3300 },
      { month: 'Mar', rate: 3450, fairFloor: 3300 },
      { month: 'Apr', rate: 3400, fairFloor: 3250 },
      { month: 'May', rate: 3300, fairFloor: 3200 },
      { month: 'Jun', rate: 3250, fairFloor: 3150 },
      { month: 'Jul', rate: 3200, fairFloor: 3100 },
    ],
    regional: { 'Nairobi': 3450, 'Nakuru': 3100, 'Eldoret': 2980, 'Kisumu': 3350, 'Nyeri': 3250 }
  },
  'Avocados': { 
    type: 'produce',
    baseRate: 22, 
    unit: 'piece', 
    trend: 'stable', 
    trendPercent: '+0.8%', 
    confidence: '92%',
    verifiedTrades: 165,
    gradeMultipliers: { 'Hass Export Grade A': 1.35, 'Fuerte Grade B': 1.0, 'Local Grade C': 0.75 },
    historical: [
      { month: 'Feb', rate: 18, fairFloor: 16 },
      { month: 'Mar', rate: 20, fairFloor: 18 },
      { month: 'Apr', rate: 21, fairFloor: 19 },
      { month: 'May', rate: 22, fairFloor: 20 },
      { month: 'Jun', rate: 22, fairFloor: 20 },
      { month: 'Jul', rate: 22, fairFloor: 20 },
    ],
    regional: { 'Nairobi': 26, 'Nakuru': 20, 'Eldoret': 19, 'Kisumu': 24, 'Nyeri': 18 }
  },
  'Potatoes': { 
    type: 'produce',
    baseRate: 78, 
    unit: 'kg', 
    trend: 'up', 
    trendPercent: '+4.2%', 
    confidence: '95%',
    verifiedTrades: 290,
    gradeMultipliers: { 'Grade A (Large Shangi)': 1.12, 'Grade B (Medium)': 1.0, 'Grade C (Small/Seed)': 0.85 },
    historical: [
      { month: 'Feb', rate: 68, fairFloor: 64 },
      { month: 'Mar', rate: 70, fairFloor: 66 },
      { month: 'Apr', rate: 72, fairFloor: 68 },
      { month: 'May', rate: 74, fairFloor: 70 },
      { month: 'Jun', rate: 76, fairFloor: 72 },
      { month: 'Jul', rate: 78, fairFloor: 74 },
    ],
    regional: { 'Nairobi': 85, 'Nakuru': 70, 'Eldoret': 68, 'Kisumu': 82, 'Nyeri': 72 }
  },

  // Agro-Waste Exchange Commodities
  'Maize Stalks & Husks': { 
    type: 'waste',
    baseRate: 150, 
    unit: 'bundle (40kg)', 
    trend: 'up', 
    trendPercent: '+6.1%', 
    confidence: '94%',
    verifiedTrades: 128,
    gradeMultipliers: { 'Chopped/Chaffed Silage': 1.25, 'Whole Dry Stalks': 1.0, 'High Moisture Field Stalks': 0.80 },
    historical: [
      { month: 'Feb', rate: 120, fairFloor: 110 },
      { month: 'Mar', rate: 130, fairFloor: 118 },
      { month: 'Apr', rate: 135, fairFloor: 122 },
      { month: 'May', rate: 140, fairFloor: 128 },
      { month: 'Jun', rate: 145, fairFloor: 132 },
      { month: 'Jul', rate: 150, fairFloor: 138 },
    ],
    regional: { 'Nairobi': 190, 'Nakuru': 140, 'Eldoret': 130, 'Kisumu': 165, 'Nyeri': 155 }
  },
  'Sugarcane Bagasse': { 
    type: 'waste',
    baseRate: 1800, 
    unit: 'ton', 
    trend: 'stable', 
    trendPercent: '0.0%', 
    confidence: '93%',
    verifiedTrades: 86,
    gradeMultipliers: { 'Low-Moisture (<20%)': 1.20, 'Raw Bagasse (35%)': 1.0, 'High Moisture Slurry': 0.75 },
    historical: [
      { month: 'Feb', rate: 1750, fairFloor: 1650 },
      { month: 'Mar', rate: 1780, fairFloor: 1680 },
      { month: 'Apr', rate: 1800, fairFloor: 1700 },
      { month: 'May', rate: 1800, fairFloor: 1700 },
      { month: 'Jun', rate: 1800, fairFloor: 1700 },
      { month: 'Jul', rate: 1800, fairFloor: 1700 },
    ],
    regional: { 'Kakamega': 1600, 'Kisumu': 1750, 'Nakuru': 1950, 'Nairobi': 2200, 'Eldoret': 1850 }
  },
  'Coffee Husks': { 
    type: 'waste',
    baseRate: 850, 
    unit: '90kg bag', 
    trend: 'up', 
    trendPercent: '+8.3%', 
    confidence: '96%',
    verifiedTrades: 112,
    gradeMultipliers: { 'Dry Parchment Husks': 1.18, 'Standard Dried Husks': 1.0, 'Moist Cherry Offcuts': 0.82 },
    historical: [
      { month: 'Feb', rate: 750, fairFloor: 700 },
      { month: 'Mar', rate: 780, fairFloor: 720 },
      { month: 'Apr', rate: 800, fairFloor: 740 },
      { month: 'May', rate: 820, fairFloor: 760 },
      { month: 'Jun', rate: 840, fairFloor: 780 },
      { month: 'Jul', rate: 850, fairFloor: 800 },
    ],
    regional: { 'Nyeri': 780, 'Kiambu': 820, 'Nairobi': 950, 'Nakuru': 880, 'Kisumu': 920 }
  },
};

const PricingTool = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('produce'); // 'produce' | 'waste'
  const [selectedItem, setSelectedItem] = useState('Tomatoes');
  const [quantity, setQuantity] = useState(1);
  const [grade, setGrade] = useState('Grade B (Standard)');
  const [region, setRegion] = useState('Nakuru');
  const [copiedBadge, setCopiedBadge] = useState(false);

  // Filter items based on active tab
  const availableItems = Object.keys(MARKET_BENCHMARKS).filter(
    k => MARKET_BENCHMARKS[k].type === activeTab
  );

  const currentData = MARKET_BENCHMARKS[selectedItem] || MARKET_BENCHMARKS['Tomatoes'];

  // Calculate pricing metrics
  const gradeMultiplier = currentData.gradeMultipliers?.[grade] || 1.0;
  const regionalRate = currentData.regional?.[region] || currentData.baseRate;
  const regionalMultiplier = regionalRate / currentData.baseRate;

  const calculatedUnitPrice = Math.round(currentData.baseRate * gradeMultiplier * regionalMultiplier);
  const calculatedTotalPrice = Math.round(calculatedUnitPrice * quantity);
  
  const priceFloorTotal = Math.round(calculatedTotalPrice * 0.90);
  const priceCeilingTotal = Math.round(calculatedTotalPrice * 1.12);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    const firstItem = Object.keys(MARKET_BENCHMARKS).find(k => MARKET_BENCHMARKS[k].type === tab);
    if (firstItem) {
      setSelectedItem(firstItem);
      setGrade(Object.keys(MARKET_BENCHMARKS[firstItem].gradeMultipliers)[1] || Object.keys(MARKET_BENCHMARKS[firstItem].gradeMultipliers)[0]);
    }
  };

  const handleApplyToListing = () => {
    if (activeTab === 'waste') {
      navigate('/waste-exchange');
    } else {
      navigate('/farmer/add-product');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Transparency Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1F5243] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93B]/20 border border-[#E5A93B]/40 text-[#E5A93B] text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#E5A93B]" />
            AI Verified Pricing Engine
          </div>
          <h1 className="text-3xl font-black text-white">Market & Waste Valuation Tool</h1>
          <p className="text-sm text-[#A3B8B0]">Transparent, data-backed fair trade price calculations for farm produce and agricultural waste exchange.</p>
        </div>

        {/* Verification Source Badge */}
        <div className="bg-[#13382E] border border-[#1F5243] p-3.5 rounded-xl flex items-center gap-3 shrink-0">
          <div className="p-2.5 bg-[#0B251D] rounded-lg border border-[#1F5243]">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white flex items-center gap-1">
              Verified Data Index
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">LIVE</span>
            </p>
            <p className="text-[#A3B8B0] text-[11px]">KAMIS & Uzamali Escrow Ledger (2026)</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Produce vs Agro-Waste */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleTabSwitch('produce')}
          className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
            activeTab === 'produce'
              ? 'bg-[#E5A93B] text-[#0B251D] border-[#E5A93B] shadow-lg shadow-[#E5A93B]/20'
              : 'bg-[#13382E] text-[#A3B8B0] border-[#1F5243] hover:text-white hover:bg-[#226351]/40'
          }`}
        >
          <Calculator className="w-5 h-5" />
          Fresh Produce Calculator
        </button>
        <button
          onClick={() => handleTabSwitch('waste')}
          className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
            activeTab === 'waste'
              ? 'bg-[#E5A93B] text-[#0B251D] border-[#E5A93B] shadow-lg shadow-[#E5A93B]/20'
              : 'bg-[#13382E] text-[#A3B8B0] border-[#1F5243] hover:text-white hover:bg-[#226351]/40'
          }`}
        >
          <Layers className="w-5 h-5" />
          Agro-Waste Valuation Engine
        </button>
      </div>

      {/* Main Calculator & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-6 bg-[#13382E] border border-[#1F5243] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1F5243] pb-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#E5A93B]" />
              Multi-Factor Price Calculator
            </h2>
            <span className="text-xs font-semibold text-[#A3B8B0] bg-[#0B251D] px-2.5 py-1 rounded-lg border border-[#1F5243]">
              {currentData.verifiedTrades} trades indexed
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#A3B8B0] uppercase mb-2">
                Select {activeTab === 'produce' ? 'Commodity Crop' : 'Agro-Waste Material'}
              </label>
              <select
                value={selectedItem}
                onChange={(e) => {
                  setSelectedItem(e.target.value);
                  setGrade(Object.keys(MARKET_BENCHMARKS[e.target.value].gradeMultipliers)[0]);
                }}
                className="w-full bg-[#0B251D] border border-[#1F5243] text-white rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-[#E5A93B]"
              >
                {availableItems.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#A3B8B0] uppercase mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#0B251D] border border-[#1F5243] text-white rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-[#E5A93B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A3B8B0] uppercase mb-2">Trading Unit</label>
                <div className="w-full bg-[#0B251D]/60 border border-[#1F5243] text-white rounded-xl p-3 text-sm font-bold text-center">
                  {currentData.unit}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#A3B8B0] uppercase mb-2">Quality Grade / Condition</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-[#0B251D] border border-[#1F5243] text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-[#E5A93B]"
                >
                  {Object.keys(currentData.gradeMultipliers).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3B8B0] uppercase mb-2">County Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#0B251D] border border-[#1F5243] text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-[#E5A93B]"
                >
                  {Object.keys(currentData.regional).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Result Output Card */}
          <div className="p-5 bg-gradient-to-b from-[#0B251D] to-[#0d2e25] border border-[#1F5243] rounded-xl text-center space-y-3 relative">
            <div className="flex items-center justify-between text-xs text-[#A3B8B0]">
              <span>Confidence Score: <strong className="text-emerald-400">{currentData.confidence}</strong></span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                {currentData.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                {currentData.trendPercent}
              </span>
            </div>

            <div>
              <p className="text-xs text-[#A3B8B0] font-semibold uppercase tracking-wider">Suggested Fair Market Total</p>
              <p className="text-4xl font-black text-[#E5A93B] mt-1">
                KES {calculatedTotalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-white/80 font-bold mt-1">
                (KES {calculatedUnitPrice.toLocaleString()} per {currentData.unit})
              </p>
            </div>

            {/* Credibility Price Band */}
            <div className="pt-3 border-t border-[#1F5243] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-[#13382E] rounded-lg border border-[#1F5243]">
                <p className="text-[10px] text-[#A3B8B0]">Floor Min</p>
                <p className="font-bold text-white">KES {priceFloorTotal.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-[#226351]/50 rounded-lg border border-[#E5A93B]/40 text-[#E5A93B]">
                <p className="text-[10px] text-[#E5A93B]">Fair Target</p>
                <p className="font-black">KES {calculatedTotalPrice.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-[#13382E] rounded-lg border border-[#1F5243]">
                <p className="text-[10px] text-[#A3B8B0]">Premium High</p>
                <p className="font-bold text-white">KES {priceCeilingTotal.toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={handleApplyToListing}
              className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 mt-2"
            >
              <Tag className="w-4 h-4" />
              Apply Price to {activeTab === 'produce' ? 'New Produce Listing' : 'Waste Exchange Listing'}
            </button>
          </div>
        </div>

        {/* Right Transparency & Trends Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Price Driver Breakdown */}
          <div className="bg-[#13382E] border border-[#1F5243] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E5A93B]" />
              Price Driver Itemization & Credibility Audit
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-[#0B251D] rounded-xl border border-[#1F5243]">
                <span className="text-[#A3B8B0]">Base Commodity Rate ({selectedItem})</span>
                <span className="font-bold text-white">KES {currentData.baseRate} / {currentData.unit}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#0B251D] rounded-xl border border-[#1F5243]">
                <span className="text-[#A3B8B0]">Quality Grade Adjustment ({grade})</span>
                <span className={`font-bold ${gradeMultiplier >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {gradeMultiplier >= 1.0 ? `+${Math.round((gradeMultiplier - 1) * 100)}%` : `${Math.round((gradeMultiplier - 1) * 100)}%`}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#0B251D] rounded-xl border border-[#1F5243]">
                <span className="text-[#A3B8B0]">Regional Freight Index ({region})</span>
                <span className="font-bold text-white">KES {regionalRate} / {currentData.unit}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#0B251D] rounded-xl border border-[#1F5243]">
                <span className="text-[#A3B8B0]">Data Credibility Verification</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Audit Verified
                </span>
              </div>
            </div>
          </div>

          {/* Historical Price Trend Chart */}
          <div className="bg-[#13382E] border border-[#1F5243] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#E5A93B]" />
                6-Month Price Trend ({selectedItem})
              </h3>
              <span className="text-[11px] text-[#A3B8B0]">Spot vs Fair Floor</span>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.historical}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E5A93B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#E5A93B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F5243" />
                  <XAxis dataKey="month" stroke="#A3B8B0" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#A3B8B0" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B251D', borderColor: '#1F5243', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#E5A93B" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" name="Spot Price (KES)" />
                  <Area type="monotone" dataKey="fairFloor" stroke="#226351" strokeWidth={2} fillOpacity={0} name="Fair Floor Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Price Comparison Matrix */}
      <div className="bg-[#13382E] border border-[#1F5243] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#E5A93B]" />
          Regional County Price Benchmark Comparison ({selectedItem})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(currentData.regional).map(([rName, rPrice]) => (
            <div 
              key={rName} 
              onClick={() => setRegion(rName)}
              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                region === rName 
                  ? 'bg-[#226351]/60 border-[#E5A93B] text-white shadow-md' 
                  : 'bg-[#0B251D] border-[#1F5243] text-[#A3B8B0] hover:text-white hover:border-[#226351]'
              }`}
            >
              <p className="text-xs font-semibold">{rName}</p>
              <p className="text-base font-black text-[#E5A93B] mt-0.5">KES {rPrice}</p>
              <p className="text-[10px] text-[#A3B8B0]">per {currentData.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingTool;
