import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Navigation, Phone, Info } from 'lucide-react';

const CourierDashboard = () => {
  const [activeTab, setActiveTab] = useState('Available');

  const availableJobs = [
    {
      id: 'JOB-SHHCad01',
      pickup: 'Warehouse A, Industrial Area, Nairobi',
      delivery: 'Westlands, Nairobi',
      product: '20kg Tomatoes',
      farmer: 'John Farmer',
      distance: '12km',
      fee: 'KES 450'
    },
    {
      id: 'JOB-SHHCad02',
      pickup: 'Farmers Market, Kiambu',
      delivery: 'Kilimani, Nairobi',
      product: '50kg Maize Grains',
      farmer: 'Peter Ndung\'u',
      distance: '25km',
      fee: 'KES 800'
    }
  ];

  const activeJobs = [
    {
      id: 'JOB-SHHCad00',
      pickup: 'Limuru Farms',
      delivery: 'Nairobi CBD',
      product: '10 Crates of Eggs',
      status: 'in transit',
      buyerPhone: '+254712345678'
    }
  ];

  const JobCard = ({ job, isAvailable }) => (
    <div className="card mb-4 overflow-hidden dark:border-primary/30">
      <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center transition-colors">
        <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">Order ID: {job.id}</span>
        {isAvailable ? (
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">pending</span>
        ) : (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            job.status === 'in transit' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {job.status}
          </span>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <div className="w-0.5 h-8 bg-gray-200 dark:bg-zinc-800 my-1"></div>
            <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Pickup From:</p>
              <p className="text-sm font-semibold text-primary dark:text-accent">{job.pickup}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Deliver To:</p>
              <p className="text-sm font-semibold text-primary dark:text-accent">{job.delivery}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-primary-light dark:bg-primary/10 rounded-lg flex justify-between items-center transition-colors">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Product: <span className="font-bold dark:text-white">{job.product}</span></p>
            {isAvailable && <p className="text-xs text-gray-500 dark:text-gray-400">Distance: <span className="font-bold dark:text-white">{job.distance}</span></p>}
          </div>
          <div className="text-right">
            {isAvailable ? (
              <p className="text-lg font-black text-primary dark:text-accent">{job.fee}</p>
            ) : (
              <button className="p-2 bg-white dark:bg-zinc-800 rounded-full text-accent shadow-sm border border-accent/20">
                <Phone className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isAvailable ? (
          <button className="w-full btn-highlight flex items-center justify-center gap-2 py-3">
            <Truck className="w-5 h-5" />
            Accept Delivery
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary dark:text-accent font-bold rounded-md text-sm hover:bg-primary/10 transition-colors">
              <Navigation className="w-4 h-4" />
              Navigate
            </button>
            <button className="btn-accent flex items-center justify-center gap-2 py-3 text-sm">
              <CheckCircle className="w-4 h-4" />
              Mark Delivered
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-accent">Courier Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Find and manage your delivery jobs.</p>
      </div>

      <div className="flex bg-white dark:bg-zinc-900 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-zinc-800 transition-colors">
        <button 
          onClick={() => setActiveTab('Available')}
          className={`flex-1 py-3 font-bold rounded-md transition-all ${
            activeTab === 'Available' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          Available Jobs ({availableJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('Active')}
          className={`flex-1 py-3 font-bold rounded-md transition-all ${
            activeTab === 'Active' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          My Active Jobs ({activeJobs.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'Available' ? (
          availableJobs.length > 0 ? (
            availableJobs.map(job => <JobCard key={job.id} job={job} isAvailable={true} />)
          ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 transition-colors">
              <Info className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-semibold">No available jobs in your area.</p>
            </div>
          )
        ) : (
          activeJobs.length > 0 ? (
            activeJobs.map(job => <JobCard key={job.id} job={job} isAvailable={false} />)
          ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 transition-colors">
              <Truck className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-semibold">You don't have any active deliveries.</p>
            </div>
          )
        )}
      </div>

      {/* Mobile Bottom Nav Spacer */}
      <div className="h-20 md:hidden"></div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-around items-center p-4 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-colors">
        <button className="text-primary dark:text-accent flex flex-col items-center gap-1">
          <Truck className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="text-gray-400 dark:text-zinc-500 flex flex-col items-center gap-1">
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-bold">History</span>
        </button>
        <button className="text-gray-400 dark:text-zinc-500 flex flex-col items-center gap-1">
          <Navigation className="w-6 h-6" />
          <span className="text-[10px] font-bold">Maps</span>
        </button>
        <button className="text-gray-400 dark:text-zinc-500 flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-800"></div>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default CourierDashboard;
