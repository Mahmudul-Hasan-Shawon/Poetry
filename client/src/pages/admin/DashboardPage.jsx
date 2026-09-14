import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiAnalytics } from '../../api/client';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiAnalytics.overview();
        setStats(data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return null;
  if (!stats) return <div className="text-ink-400">Failed to load dashboard</div>;

  const cards = [
    { label: 'Total Writings', value: stats.totalWritings, color: 'text-gold-400' },
    { label: 'Published', value: stats.publishedWritings, color: 'text-emerald-400' },
    { label: 'Drafts', value: stats.draftWritings, color: 'text-amber-400' },
    { label: 'Authors', value: stats.totalAuthors, color: 'text-blue-400' },
    { label: 'Categories', value: stats.totalCategories, color: 'text-purple-400' },
    { label: 'Collections', value: stats.totalCollections, color: 'text-pink-400' },
    { label: 'Total Views', value: stats.totalViews, color: 'text-cyan-400' },
    { label: 'Total Saves', value: stats.totalSaves, color: 'text-rose-400' },
  ];

  const actions = [
    { to: '/admin/writings/new', label: 'New Writing', icon: 'M12 4v16m8-8H4' },
    { to: '/admin/authors/new', label: 'New Author', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to: '/admin/collections/new', label: 'Create Collection', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { to: '/admin/import-export', label: 'Import / Export', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  ];
  const manages = [
    { to: '/admin/writings', label: 'All Writings', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { to: '/admin/authors', label: 'All Authors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to: '/admin/categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { to: '/admin/collections', label: 'Collections', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-body text-2xl text-ink-100">Dashboard</h1>
          <p className="font-body text-sm text-ink-500 mt-1">Overview of your poetry archive</p>
        </div>
        <Link to="/admin/writings/new" className="btn-primary text-xs whitespace-nowrap">
          + New Writing
        </Link>
      </div>

      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" step={0.05}>
        {cards.map((card) => (
          <Item
            key={card.label}
            y={10}
            className="p-6 bg-ink-900/40 border border-ink-800/30 rounded-sm"
          >
            <p className="font-body text-xs text-ink-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`font-body font-bold text-3xl ${card.color}`}>{card.value.toLocaleString()}</p>
          </Item>
        ))}
      </Stagger>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="p-6 bg-ink-900/40 border border-ink-800/30 rounded-sm">
          <h3 className="font-body text-xs uppercase tracking-wider text-ink-400 mb-4">Quick Actions</h3>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-2" delay={0.1}>
            {actions.map((a) => (
              <Item key={a.to} y={0}>
                <Link
                  to={a.to}
                  className="group flex items-center gap-3 p-3 rounded-sm border border-ink-800/30 bg-ink-900/20 hover:border-gold-500/40 hover:bg-ink-900/40 transition-all"
                >
                  <div className="w-8 h-8 rounded bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:text-gold-300 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                    </svg>
                  </div>
                  <span className="font-body text-sm text-ink-200 group-hover:text-gold-400 transition-colors">{a.label}</span>
                  <svg className="ml-auto w-4 h-4 text-ink-500 group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Item>
            ))}
          </Stagger>
        </div>

        {/* Manage */}
        <div className="p-6 bg-ink-900/40 border border-ink-800/30 rounded-sm">
          <h3 className="font-body text-xs uppercase tracking-wider text-ink-400 mb-4">Manage</h3>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-2" delay={0.1}>
            {manages.map((a) => (
              <Item key={a.to} y={0}>
                <Link
                  to={a.to}
                  className="group flex items-center gap-3 p-3 rounded-sm border border-ink-800/30 bg-ink-900/20 hover:border-gold-500/40 hover:bg-ink-900/40 transition-all"
                >
                  <div className="w-8 h-8 rounded bg-ink-700/30 group-hover:bg-gold-500/10 flex items-center justify-center text-ink-400 group-hover:text-gold-400 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                    </svg>
                  </div>
                  <span className="font-body text-sm text-ink-200 group-hover:text-gold-400 transition-colors">{a.label}</span>
                  <svg className="ml-auto w-4 h-4 text-ink-500 group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Item>
            ))}
          </Stagger>
        </div>
      </div>
    </div>
  );
}
