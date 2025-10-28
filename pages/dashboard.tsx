import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import ThemeToggle from '../components/ThemeToggle';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'seller':
        return {
          title: 'Seller Dashboard',
          description: 'Manage your products and track your sales',
          features: [
            'Create new product listings',
            'Manage your inventory',
            'View sales analytics',
            'Respond to buyer inquiries'
          ],
          actions: [
            { label: 'Add New Listing', path: '/listings/new', description: 'Add new products to sell' },
            { label: 'View My Listings', path: '/listings', description: 'Manage your existing products' },
            { label: 'Sales Reports', path: '/reports', description: 'View your sales performance' }
          ]
        };
      case 'buyer':
        return {
          title: 'Buyer Dashboard',
          description: 'Discover quality agricultural products',
          features: [
            'Browse available products',
            'Save favorite listings',
            'Contact sellers directly',
            'Track your orders'
          ],
          actions: [
            { label: 'Browse Marketplace', path: '/marketplace', description: 'Browse available products' },
            { label: 'My Orders', path: '/orders', description: 'Track your purchase history' },
            { label: 'Saved Items', path: '/saved', description: 'View your favorite products' }
          ]
        };
      case 'courier':
        return {
          title: 'Courier Dashboard',
          description: 'Manage deliveries and grow your business',
          features: [
            'View available delivery requests',
            'Manage active deliveries',
            'Track delivery history',
            'Update availability status'
          ],
          actions: [
            { label: 'Available Deliveries', path: '/deliveries', description: 'View available delivery requests' },
            { label: 'My Deliveries', path: '/my-deliveries', description: 'Manage your active deliveries' },
            { label: 'Earnings', path: '/earnings', description: 'Check your delivery earnings' }
          ]
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to Uzamali',
          features: [],
          actions: []
        };
    }
  };

  const content = getDashboardContent();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold">{content.title}</h1>
                <p className="text-muted-foreground">{content.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <div className="text-right">
                  <p className="font-semibold">{user?.displayName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Card */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Welcome back, {user?.displayName}!
                </h2>
                <p className="text-muted-foreground">
                  Ready to {user?.role === 'seller' ? 'sell your products' : 
                           user?.role === 'buyer' ? 'find quality products' : 
                           'manage your deliveries'}?
                </p>
              </div>
              <div className="text-4xl">
                {user?.role === 'seller' && '🌱'}
                {user?.role === 'buyer' && '🏢'}
                {user?.role === 'courier' && '🚚'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {content.actions.map((action, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg shadow-sm p-6 hover:border-primary transition-colors cursor-pointer group"
                onClick={() => router.push(action.path)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </h3>
                  <svg 
                    className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">
                  {action.description}
                </p>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              What you can do as a {user?.role}:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center group">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section (Optional) */}
          {user?.role === 'seller' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Messages</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">KSH 0</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
            </div>
          )}

          {user?.role === 'buyer' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Active Orders</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Saved Items</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Messages</div>
              </div>
            </div>
          )}

          {user?.role === 'courier' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Active Deliveries</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">KSH 0</div>
                <div className="text-sm text-muted-foreground">Earnings</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}