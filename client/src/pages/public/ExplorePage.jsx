import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiWritings, apiCategories, apiAuthors } from '../../api/client';
import QuoteCard from '../../components/quotes/QuoteCard';
import Pagination from '../../components/ui/Pagination';
import { QuoteCardSkeleton } from '../../components/ui/Skeletons';
import { debounce } from '../../utils/helpers';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [writings, setWritings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authorsList, setAuthorsList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentType = searchParams.get('type') || '';
  const currentLanguage = searchParams.get('language') || '';
  const currentAuthor = searchParams.get('author') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    async function load() {
      try {
        const [cats, auths] = await Promise.all([apiCategories.list(), apiAuthors.list()]);
        setCategories(cats);
        setAuthorsList(auths);
      } catch {}
    }
    load();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        if (currentSearch) params.search = currentSearch;
        if (currentCategory) params.category = currentCategory;
        if (currentType) params.type = currentType;
        if (currentLanguage) params.language = currentLanguage;
        if (currentAuthor) params.author = currentAuthor;

        const data = await apiWritings.list(params);
        setWritings(data.writings);
        setPagination(data.pagination);
      } catch {}
      setLoading(false);
    }
    load();
  }, [currentSearch, currentCategory, currentType, currentLanguage, currentAuthor, currentPage]);

  const updateParam = useCallback(
    debounce((key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      });
    }, 300),
    [setSearchParams]
  );

  const handleSearch = (e) => updateParam('search', e.target.value);

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = currentSearch || currentCategory || currentType || currentLanguage || currentAuthor;

  const types = [
    { value: 'quote', label: 'Quotes' },
    { value: 'poetry', label: 'Poetry' },
    { value: 'verse', label: 'Verses' },
    { value: 'ghazal', label: 'Ghazals' },
    { value: 'proverb', label: 'Proverbs' },
    { value: 'wisdom', label: 'Wisdom' },
    { value: 'reflection', label: 'Reflections' },
    { value: 'letter', label: 'Letters' },
  ];

  const languages = [
    { value: '', label: 'All Languages' },
    { value: 'english', label: 'English' },
    { value: 'bangla', label: 'Bengali' },
    { value: 'urdu', label: 'Urdu' },
    { value: 'persian', label: 'Persian' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
  ];

  const activeType = types.find((t) => t.value === currentType);
  const activeCategory = categories.find((c) => c.slug === currentCategory);
  const activeLanguage = languages.find((l) => l.value === currentLanguage);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
            The Archive
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink-100 mb-4">
            Explore
          </h1>
          <p className="font-body text-ink-400 max-w-lg mx-auto">
            Browse through our collection of poetry, quotes, and wisdom from across time and cultures.
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by quote, author, or keyword..."
              defaultValue={currentSearch}
              onChange={handleSearch}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-sm border border-ink-800/30 bg-ink-900/20 p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Type */}
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-ink-500 block mb-2">
                Type
              </label>
              <select
                value={currentType}
                onChange={(e) => setFilter('type', e.target.value)}
                className="select-field"
              >
                <option value="">All Types</option>
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-ink-500 block mb-2">
                Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => setFilter('category', e.target.value)}
                className="select-field"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-ink-500 block mb-2">
                Language
              </label>
              <select
                value={currentLanguage}
                onChange={(e) => setFilter('language', e.target.value)}
                className="select-field"
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Applied filters */}
          <div className="mt-5 pt-4 border-t border-ink-800/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {!hasFilters && (
                <span className="font-body text-xs text-ink-600">Showing everything — refine with the filters above</span>
              )}
              {activeType && (
                <span className="font-body text-xs inline-flex items-center gap-2 bg-gold-500/15 text-gold-400 border border-gold-500/25 rounded-sm px-3 py-1">
                  {activeType.label}
                  <button onClick={() => setFilter('type', '')} aria-label="Remove type filter" className="opacity-60 hover:opacity-100 transition-opacity leading-none">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              )}
              {activeCategory && (
                <span className="font-body text-xs inline-flex items-center gap-2 bg-gold-500/15 text-gold-400 border border-gold-500/25 rounded-sm px-3 py-1">
                  {activeCategory.name}
                  <button onClick={() => setFilter('category', '')} aria-label="Remove category filter" className="opacity-60 hover:opacity-100 transition-opacity leading-none">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              )}
              {activeLanguage && (
                <span className="font-body text-xs inline-flex items-center gap-2 bg-gold-500/15 text-gold-400 border border-gold-500/25 rounded-sm px-3 py-1">
                  {activeLanguage.label}
                  <button onClick={() => setFilter('language', '')} aria-label="Remove language filter" className="opacity-60 hover:opacity-100 transition-opacity leading-none">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              )}
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="font-body text-xs text-ink-500 hover:text-gold-400 transition-colors underline underline-offset-4">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <QuoteCardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : writings.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink-400">No writings found</p>
            <p className="font-body text-sm text-ink-500 mt-2">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <>
            {pagination && (
              <p className="font-body text-xs text-ink-500 mb-6">
                {pagination.total} {pagination.total === 1 ? 'writing' : 'writings'} found
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {writings.map((writing, i) => (
                <QuoteCard key={writing.id} writing={writing} index={i} />
              ))}
            </div>

            {pagination && <Pagination pagination={pagination} />}
          </>
        )}
      </div>
    </div>
  );
}
