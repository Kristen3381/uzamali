import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Edit2, Trash2, CheckCircle, XCircle, Plus, MapPin, Leaf } from 'lucide-react';
import { getMyProducts, updateProduct, deleteProduct } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const MyProducts = () => {
  const { maliPoints } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getMyProducts();
      setProducts(data);
    } catch {
      alert('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product listing?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Failed to delete product');
    }
  };

  const handleMarkSold = async (product) => {
    try {
      const fd = new FormData();
      fd.append('status', 'sold');
      await updateProduct(product._id, fd);
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, status: 'sold' } : p))
      );
    } catch {
      alert('Failed to mark as sold');
    }
  };

  const activeProducts = products.filter((p) => p.status === 'available');
  const soldProducts = products.filter((p) => p.status === 'sold');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-accent">My Products</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {activeProducts.length} active &middot; {soldProducts.length} sold
          </p>
        </div>
        <div className="flex gap-4">
          <div className="glass p-2 px-4 rounded-xl flex items-center gap-2 shadow-sm">
            <Leaf className="w-5 h-5 text-primary dark:text-accent fill-current" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">Mali Points</p>
              <p className="text-lg font-black text-primary dark:text-accent leading-none">{maliPoints}</p>
            </div>
          </div>
          <Link
            to="/farmer/add-product"
            className="btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-md hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" /> Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-lg">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">You haven't listed any products yet</p>
          <Link
            to="/farmer/add-product"
            className="btn-primary inline-flex items-center gap-2 py-3 px-6"
          >
            <Plus className="w-5 h-5" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeProducts.map((product) => (
            <div
              key={product._id}
              className="card flex flex-col md:flex-row gap-4 p-4 items-start"
            >
              <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden bg-white/20 shrink-0">
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-primary dark:text-accent">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{product.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                  <span className="font-bold text-gray-800 dark:text-white">
                    KES {product.price?.toLocaleString()} / {product.unit}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3 h-3" /> {product.location}
                  </span>
                  {product.sustainable && (
                    <span className="badge-sustainable text-[10px]">Sustainable</span>
                  )}
                  <span className="text-gray-400 text-xs">
                    Qty: {product.quantity}
                  </span>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => navigate(`/farmer/edit-product/${product._id}`)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 border border-primary/30 text-primary dark:text-accent rounded-lg hover:bg-primary/10 text-sm font-bold transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleMarkSold(product)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 text-sm font-bold transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Sold
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 text-sm font-bold transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}

          {soldProducts.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 pt-4 border-t border-white/10">
                Sold ({soldProducts.length})
              </h2>
              {soldProducts.map((product) => (
                <div
                  key={product._id}
                  className="card flex flex-col md:flex-row gap-4 p-4 items-start opacity-60"
                >
                  <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden bg-white/20 shrink-0">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 line-through">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-400 uppercase">Sold</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 text-sm font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
