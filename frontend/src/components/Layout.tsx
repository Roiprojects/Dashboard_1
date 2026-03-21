import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="relative sticky top-0 z-50 glass border-b px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-brand-600 p-1.5 sm:p-2 rounded-lg shrink-0 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>

        <span className="absolute left-1/2 -translate-x-1/2 text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight whitespace-nowrap">
          Website Development Leads
        </span>
        
        <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0 overflow-x-auto overflow-y-hidden">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-brand-600 ${location.pathname === '/' ? 'text-brand-600 dark:text-brand-500' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Dashboard
          </Link>
          {token ? (
            <>
              <Link 
                to="/admin" 
                className={`text-sm font-medium transition-colors flex items-center gap-1 hover:text-brand-600 ${location.pathname === '/admin' ? 'text-brand-600 dark:text-brand-500' : 'text-slate-600 dark:text-slate-300'}`}
              >
                <Settings className="w-4 h-4" /> Admin
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Admin Login
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
