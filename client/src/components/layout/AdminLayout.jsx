import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { Stagger, Item } from '../ui/motion.jsx';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', exact: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/admin/writings', label: 'Writings', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { to: '/admin/authors', label: 'Authors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { to: '/admin/categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { to: '/admin/collections', label: 'Collections', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { to: '/admin/import-export', label: 'Import / Export', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);

  // Reset the scrollable admin area to the top on navigation
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path, exact) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <Stagger className="h-screen overflow-hidden bg-ink-950 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-ink-900 border-r border-ink-800/50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-ink-800/50">
            <Link to="/admin" className="flex items-center gap-3">
              <img
                src="/Images/logo/admin.svg"
                alt="Admin"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="font-body text-sm text-ink-100 block">Admin Panel</span>
                <span className="font-body text-xs text-ink-500">Poetry Archive</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => (
              <Item key={link.to} y={0}>
                <Link
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-body transition-all duration-200 ${
                    isActive(link.to, link.exact)
                      ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500'
                      : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/50 border-l-2 border-transparent'
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                  {link.label}
                </Link>
              </Item>
            ))}
          </nav>

          <div className="p-4 border-t border-ink-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/Images/logo/shan.png"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-body text-sm text-ink-300">{user?.username || 'Admin'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-ink-500 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-20 bg-ink-950/80 backdrop-blur-md border-b border-ink-800/30 px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-ink-400 hover:text-ink-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <Link
              to="/"
              target="_blank"
              className="font-body text-xs text-ink-500 hover:text-gold-400 transition-colors flex items-center gap-1"
            >
              View Site
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 p-6 lg:p-8 overflow-y-auto overscroll-contain">
          <Item y={0}>
            <Outlet />
          </Item>
        </main>
      </div>
    </Stagger>
  );
}
