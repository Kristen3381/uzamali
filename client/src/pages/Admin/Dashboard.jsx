import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, DollarSign, ShoppingCart, Leaf } from 'lucide-react';

const AdminDashboard = () => {
  const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 4500 },
    { name: 'May', sales: 6000 },
  ];

  const categoryData = [
    { name: 'Vegetables', value: 400 },
    { name: 'Grains', value: 300 },
    { name: 'Fruits', value: 300 },
    { name: 'Agro-waste', value: 200 },
  ];

  const COLORS = ['#1E5631', '#27AE60', '#F1C40F', '#D5F5E3'];

  const stats = [
    { label: 'Total Users', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Platform Revenue', value: 'KES 1.2M', icon: DollarSign, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'Total Orders', value: '8,420', icon: ShoppingCart, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Waste Saved', value: '12.5 Tons', icon: Leaf, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Analytics</h1>
        <p className="text-gray-600">Overview of platform performance and growth metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border-2 border-primary-light shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl border-2 border-primary-light shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-6">Sales Growth (Monthly)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#1E5631" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl border-2 border-primary-light shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-6">Top Selling Categories</h2>
          <div className="h-80 w-full flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 w-full md:w-48 mt-4 md:mt-0">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-gray-600 font-semibold">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table Snippet */}
      <div className="bg-white rounded-xl border-2 border-primary-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Recent Users</h2>
          <button className="text-accent hover:underline text-sm font-bold">Manage All Users</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Sarah Omolo', email: 'sarah@farmer.com', role: 'Farmer', loc: 'Nakuru', status: 'Verified' },
                { name: 'David Muli', email: 'david@buyer.com', role: 'Buyer', loc: 'Nairobi', status: 'Active' },
                { name: 'Kevin Kip', email: 'kevin@courier.com', role: 'Courier', loc: 'Eldoret', status: 'Pending' },
              ].map((user, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm font-semibold capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-gray-600">{user.loc}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      user.status === 'Verified' ? 'bg-green-100 text-green-700' :
                      user.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
