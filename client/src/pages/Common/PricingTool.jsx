import React, { useState } from 'react';
import { Calculator, TrendingUp, Info, AlertTriangle } from 'lucide-react';

const PricingTool = () => {
  const [crop, setCrop] = useState('Tomatoes');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('kg');

  const marketRates = {
    'Tomatoes': { rate: 45, trend: 'up' },
    'Maize': { rate: 3100, unit: '90kg bag', trend: 'down' },
    'Avocados': { rate: 20, unit: 'piece', trend: 'stable' },
    'Potatoes': { rate: 75, trend: 'up' },
    'Beans': { rate: 120, trend: 'down' }
  };

  const getSuggestedPrice = () => {
    const data = marketRates[crop] || { rate: 0, trend: 'stable' };
    const baseRate = data.rate || 0;
    const unitMultiplier = unit === '90kg bag' ? 1 : unit === 'crate' ? 0.8 : 1;
    return Math.round(baseRate * quantity * unitMultiplier);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-accent">Market Pricing Tool</h1>
        <p className="text-gray-600 dark:text-gray-400">Calculate suggested prices based on current market trends and listings near you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-primary dark:text-accent font-bold border-b border-white/20 pb-4">
            <Calculator className="w-5 h-5" />
            Price Calculator
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Select Crop Type</label>
              <select 
                className="input-field"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                {Object.keys(marketRates).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Quantity</label>
                <input 
                  type="number" 
                  className="input-field"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary dark:text-accent mb-2">Unit</label>
                <select 
                  className="input-field"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="kg">kg</option>
                  <option value="90kg bag">90kg bag</option>
                  <option value="piece">piece</option>
                  <option value="crate">crate</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 glass rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Suggested Market Price</p>
            <p className="text-4xl font-black text-primary dark:text-accent transition-colors">KES {getSuggestedPrice().toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 shadow-md">
            <h3 className="font-bold text-primary dark:text-accent mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Market Trends
            </h3>
            <div className="space-y-4">
              {Object.entries(marketRates).map(([name, data]) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">KES {data.rate}/{data.unit || 'kg'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      data.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      data.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400'
                    }`}>
                      {data.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-4 rounded-xl border border-highlight/30 flex gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0" />
            <p className="text-xs text-gray-700 dark:text-yellow-400 leading-relaxed">
              <strong>Tip:</strong> Prices are estimates based on regional averages. For the best sales, consider the "Sustainable" badge to attract premium buyers!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTool;
