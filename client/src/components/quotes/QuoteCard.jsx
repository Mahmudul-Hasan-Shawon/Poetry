import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { copyToClipboard } from '../../utils/helpers';
import { useFavorites } from '../../context/FavoritesContext';

export default function QuoteCard({ writing, index = 0 }) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const authorName = writing.author_name || writing.author?.name || '';
  const authorSlug = writing.author_slug || writing.author?.slug || '';
  const displayText = writing.text || '';
  const isRTL = writing.direction === 'rtl';
  const isBangla = writing.language === 'bangla';
  const saved = isFavorite(writing.id);
  const categories = writing.categories?.slice(0, 2) || [];

  const handleCopy = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `"${displayText}"\n\n— ${authorName}`;
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayText, authorName]);

  const handleSave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(writing.id);
  }, [writing.id, toggleFavorite]);

  const handleShare = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `"${displayText}"\n\n— ${authorName}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Words by ${authorName}`, text }); } catch {}
    } else {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [displayText, authorName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative h-full"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Link to={`/quotes/${writing.slug}`} className="block h-full">
        <div className="relative flex flex-col h-full p-7 bg-ink-900/40 border border-ink-800/30 rounded-sm card-hover overflow-hidden">
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-gold-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quote text — flex-1 so every card fills its row height */}
          <div className={`flex-1 min-h-[160px] ${isRTL ? 'writing-rtl' : ''}`}>
            {(writing.title || writing.date) && (
              <header className="mb-4">
                {writing.title && (
                  <h3 className="font-display text-lg md:text-xl text-ink-100 leading-snug tracking-wide">
                    {writing.title}
                  </h3>
                )}
                {writing.date && (
                  <p className="font-body text-[11px] text-ink-500 mt-1.5">{writing.date}</p>
                )}
                <div className="mt-2 w-12 h-px bg-gradient-to-r from-gold-500/50 to-transparent" />
              </header>
            )}
            <p className={`${isBangla ? 'font-bangla' : 'font-display'} text-xl md:text-[1.35rem] leading-relaxed text-ink-100 italic whitespace-pre-line line-clamp-6`}>
              {displayText}
            </p>
          </div>

          {/* Footer — always anchored to the bottom */}
          <div className="mt-6 pt-5 border-t border-ink-800/40 flex items-end justify-between gap-4">
            <div className="min-w-0">
              {authorSlug ? (
                <Link
                  to={`/authors/${authorSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="group/link inline-block"
                >
                  <span className="font-brand text-base text-gold-400 group-hover/link:text-gold-300 transition-colors">
                    {authorName}
                  </span>
                </Link>
              ) : (
                <span className="font-brand text-base text-gold-400">{authorName}</span>
              )}
            </div>

            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="font-body text-[10px] uppercase tracking-wider text-ink-500 border border-ink-700/60 rounded-sm px-2 py-1"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Hover actions */}
      <div
        className={`absolute top-3 right-3 flex items-center gap-1 transition-all duration-300 ${
          showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <button
          onClick={handleCopy}
          className="p-2 rounded-sm bg-ink-900/90 text-ink-400 hover:text-gold-400 hover:bg-ink-700/90 transition-all backdrop-blur-sm border border-ink-700/50"
          title="Copy"
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <button
          onClick={handleShare}
          className="p-2 rounded-sm bg-ink-900/90 text-ink-400 hover:text-gold-400 hover:bg-ink-700/90 transition-all backdrop-blur-sm border border-ink-700/50"
          title="Share"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button
          onClick={handleSave}
          className={`p-2 rounded-sm transition-all backdrop-blur-sm border border-ink-700/50 ${
            saved
              ? 'bg-gold-500/15 text-gold-400 border-gold-500/40'
              : 'bg-ink-900/90 text-ink-400 hover:text-gold-400 hover:bg-ink-700/90'
          }`}
          title={saved ? 'Saved' : 'Save'}
        >
          <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}