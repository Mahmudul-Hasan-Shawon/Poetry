import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiWritings, apiAuthors } from '../../api/client';
import Pagination from '../../components/ui/Pagination';
import { debounce, formatShortDate, capitalizeFirst, LANGUAGES } from '../../utils/helpers';
import { Stagger, Item } from '../../components/ui/motion.jsx';

export default function WritingsPage() {
  const [writings, setWritings] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    apiAuthors.list().then(setAuthors).catch(() => {});
  }, []);

  const loadWritings = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (languageFilter) params.language = languageFilter;
      const data = await apiWritings.admin.list(params);
      setWritings(data.writings);
      setPagination(data.pagination);
    } catch {}
    setLoading(false);
  }, [search, statusFilter, typeFilter, languageFilter, currentPage]);

  useEffect(() => { loadWritings(); }, [loadWritings]);

  const handleSearch = useCallback(
    debounce((val) => setSearch(val), 300),
    []
  );

  const handleBulk = async (action) => {
    if (!selected.length) return;
    if (!confirm(`Are you sure you want to ${action} ${selected.length} writing(s)?`)) return;
    try {
      await apiWritings.admin.bulkAction({ ids: selected, action });
      setSelected([]);
      loadWritings();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this writing?')) return;
    try {
      await apiWritings.delete(id);
      loadWritings();
    } catch {}
  };

  const handleToggleFeatured = async (id) => {
    try {
      await apiWritings.admin.toggleFeatured(id);
      loadWritings();
    } catch {}
  };

  const handleSetDaily = async (id) => {
    try {
      await apiWritings.admin.setDaily(id);
      alert('Set as daily word!');
    } catch {}
  };

  const handleDuplicate = async (id) => {
    try {
      await apiWritings.admin.duplicate(id);
      loadWritings();
    } catch {}
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === writings.length) setSelected([]);
    else setSelected(writings.map((w) => w.id));
  };

  const statusBadge = (status) => {
    const classes = {
      published: 'badge-published',
      draft: 'badge-draft',
      archived: 'badge-archived',
    };
    return <span className={`badge ${classes[status] || 'badge-draft'}`}>{status}</span>;
  };

  return (
    <Stagger>
      <Item y={0} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-body text-2xl text-ink-100">Writings</h1>
          <p className="font-body text-sm text-ink-500 mt-1">{pagination?.total || 0} total writings</p>
        </div>
        <Link to="/admin/writings/new" className="btn-primary text-xs whitespace-nowrap">
          + New Writing
        </Link>
      </Item>

      {/* Filters */}
      <Item y={0} className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search writings..."
          onChange={(e) => handleSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field max-w-[150px]">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="select-field max-w-[150px]">
          <option value="">All Types</option>
          <option value="quote">Quote</option>
          <option value="poetry">Poetry</option>
          <option value="verse">Verse</option>
          <option value="ghazal">Ghazal</option>
          <option value="proverb">Proverb</option>
          <option value="wisdom">Wisdom</option>
          <option value="reflection">Reflection</option>
          <option value="letter">Letter</option>
        </select>
        <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="select-field max-w-[150px]">
          <option value="">All Languages</option>
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </Item>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <Item y={0} className="flex items-center gap-3 mb-4 p-3 bg-ink-900/50 border border-ink-800/30 rounded-sm">
          <span className="font-body text-xs text-ink-400">{selected.length} selected</span>
          <button onClick={() => handleBulk('publish')} className="font-body text-xs text-emerald-400 hover:text-emerald-300">Publish</button>
          <button onClick={() => handleBulk('draft')} className="font-body text-xs text-amber-400 hover:text-amber-300">Set Draft</button>
          <button onClick={() => handleBulk('archive')} className="font-body text-xs text-ink-400 hover:text-ink-300">Archive</button>
          <button onClick={() => handleBulk('delete')} className="font-body text-xs text-red-400 hover:text-red-300">Delete</button>
          <button onClick={() => setSelected([])} className="font-body text-xs text-ink-500 hover:text-ink-300 ml-auto">Clear</button>
      </Item>
      )}

      {!loading && (
        <div className="overflow-auto max-h-[calc(100vh-15rem)] border border-ink-800/30">
          <Stagger delay={0.1}>
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" checked={selected.length === writings.length && writings.length > 0} onChange={toggleSelectAll} className="rounded" />
                </th>
                <th>Writing</th>
                <th>Author</th>
                <th>Type</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {writings.map((w) => (
                <Item as="tr" key={w.id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(w.id)} onChange={() => toggleSelect(w.id)} className="rounded" />
                  </td>
                  <td>
                    <p className="text-ink-100 line-clamp-2 max-w-xs">{w.title || w.text.substring(0, 80)}</p>
                    {w.category_names && (
                      <p className="text-xs text-ink-500 mt-1">{w.category_names}</p>
                    )}
                  </td>
                  <td className="text-ink-300">{w.author_name || '—'}</td>
                  <td className="capitalize">{w.type}</td>
                  <td>{statusBadge(w.status)}</td>
                  <td>
                    <button
                      onClick={() => handleToggleFeatured(w.id)}
                      className={`transition-colors ${w.featured ? 'text-gold-400' : 'text-ink-600 hover:text-gold-400'}`}
                    >
                      {w.featured ? <i className="fa-solid fa-star text-gold-400" aria-hidden="true"></i> : <i className="fa-regular fa-star" aria-hidden="true"></i>}
                    </button>
                  </td>
                  <td className="text-ink-500 text-xs">{formatShortDate(w.created_at)}</td>
                  <td>
<div className="flex items-center gap-2">
  <Link to={`/admin/writings/${w.id}/edit`} className="text-ink-400 hover:text-gold-400 transition-colors" title="Edit" aria-label={`Edit ${w.title || 'writing'}`}>
    <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
  </Link>
  <button onClick={() => handleDuplicate(w.id)} className="text-ink-400 hover:text-gold-400 transition-colors" title="Duplicate" aria-label={`Duplicate ${w.title || 'writing'}`}>
    <i className="fa-solid fa-copy" aria-hidden="true"></i>
  </button>
  <button onClick={() => handleSetDaily(w.id)} className="text-ink-400 hover:text-gold-400 transition-colors" title="Set as Daily" aria-label={`Set ${w.title || 'writing'} as daily`}>
    <i className="fa-solid fa-calendar-day" aria-hidden="true"></i>
  </button>
  <button onClick={() => handleDelete(w.id)} className="text-ink-400 hover:text-red-400 transition-colors" title="Delete" aria-label={`Delete ${w.title || 'writing'}`}>
    <i className="fa-solid fa-trash-can" aria-hidden="true"></i>
  </button>
</div>
                  </td>
                </Item>
              ))}
            </tbody>
          </table>
          </Stagger>
        </div>
      )}

      {pagination && <Pagination pagination={pagination} />}
    </Stagger>
  );
}
