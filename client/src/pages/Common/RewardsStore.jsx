import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Gift, 
  Leaf, 
  Zap, 
  Megaphone, 
  Award, 
  ArrowRight,
  CheckCircle,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';

const RewardsStore = () => {
  const { maliPoints, addPoints, user } = useAuth();
  const [redeemedItem, setRedeemedItem] = useState(null);

  const rewards = [
    {
      id: 'boost',
      title: 'Marketplace Boost',
      description: 'Pin your listing to the top of search results for 24 hours.',
      cost: 200,
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      for: ['farmer']
    },
    {
      id: 'sms',
      title: 'SMS Blast',
      description: 'Notify 50 nearby buyers about your new stock via SMS.',
      cost: 500,
      icon: <Megaphone className="w-6 h-6 text-blue-500" />,
      for: ['farmer']
    },
    {
      id: 'premium_badge',
      title: 'Premium Farmer Badge',
      description: 'Get a "Verified Premium" badge next to your name for a month.',
      cost: 1000,
      icon: <Award className="w-6 h-6 text-purple-500" />,
      for: ['farmer']
    },
    {
      id: 'voucher_500',
      title: 'KES 500 Discount',
      description: 'Get a voucher for KES 500 off your next purchase.',
      cost: 450,
      icon: <ShoppingBag className="w-6 h-6 text-green-500" />,
      for: ['buyer', 'farmer']
    },
    {
      id: 'eco_pack',
      title: 'Eco-Packaging Kit',
      description: 'A set of 50 biodegradable bags for your produce.',
      cost: 300,
      icon: <Leaf className="w-6 h-6 text-accent" />,
      for: ['farmer']
    }
  ];

  const handleRedeem = (reward) => {
    if (maliPoints < reward.cost) {
      alert("Insufficient Mali Points!");
      return;
    }
    
    // In a real app, this would be an API call
    addPoints(-reward.cost);
    setRedeemedItem(reward);
    
    setTimeout(() => {
      setRedeemedItem(null);
    }, 3000);
  };

  const filteredRewards = rewards.filter(r => r.for.includes(user?.role) || r.for.includes('all'));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/90 to-accent/80 backdrop-blur-md p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gift className="w-64 h-64 -rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black">Mali Rewards Store</h1>
            <p className="text-primary-light/80 max-w-md">
              Turn your sustainability efforts into real growth. Redeem your Mali Points for feature boosts, tools, and discounts.
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 text-center min-w-[200px]">
            <p className="text-xs font-bold uppercase tracking-widest mb-1">Your Balance</p>
            <div className="flex items-center justify-center gap-2">
              <Leaf className="w-6 h-6 text-highlight fill-current" />
              <span className="text-4xl font-black">{maliPoints}</span>
            </div>
            <p className="text-[10px] mt-2 opacity-70">Mali Points Earned</p>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <motion.div 
            key={reward.id}
            whileHover={{ y: -5 }}
            className="card group border-primary/10 dark:border-primary/20 flex flex-col"
          >
            <div className="p-6 space-y-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="p-3 glass rounded-xl group-hover:bg-primary/10 transition-colors">
                  {reward.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Cost</p>
                  <p className="text-xl font-black text-primary dark:text-accent">{reward.cost} pts</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary dark:text-accent">{reward.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {reward.description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/30 dark:bg-white/5 border-t border-white/10 backdrop-blur-sm">
              <button 
                onClick={() => handleRedeem(reward)}
                disabled={maliPoints < reward.cost}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  maliPoints >= reward.cost 
                  ? 'bg-primary text-white hover:bg-accent shadow-md' 
                  : 'bg-white/20 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                }`}
              >
                {maliPoints >= reward.cost ? (
                  <>
                    Redeem Now <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  `Need ${reward.cost - maliPoints} more points`
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Success Notification */}
      {redeemedItem && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-accent text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20"
        >
          <div className="p-2 bg-white/20 rounded-full">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold">Success!</p>
            <p className="text-sm opacity-90">You redeemed {redeemedItem.title}.</p>
          </div>
        </motion.div>
      )}

      {/* Earn More Section */}
      <div className="glass p-8 rounded-3xl border border-dashed border-white/30 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-primary dark:text-accent">Want more Mali Points?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Points are earned by uploading agro-waste, maintaining a high sustainability rating, and completing eco-friendly delivery routes.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => alert('📖 Earning Guide\n\nYou earn Mali Points by:\n• Listing agro-waste products\n• Maintaining sustainable farming practices\n• Completing eco-friendly delivery routes\n• Referring other farmers to the platform')} className="btn-primary">View Earning Guide</button>
          <button onClick={() => alert('👨‍🌾 Refer a Farmer\n\nShare your referral link with other farmers! When they join and list their first product, you both earn 50 Mali Points.\n\nReferral link: https://uzamali.com/ref/' + (user?.name || 'friend'))} className="btn-accent">Refer a Farmer</button>
        </div>
      </div>
    </div>
  );
};

export default RewardsStore;
