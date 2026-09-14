import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { apiWritings } from '../../api/client';
import QuoteCard from '../../components/quotes/QuoteCard';
import { copyToClipboard } from '../../utils/helpers';
import { useFavorites } from '../../context/FavoritesContext';
import { Skeleton } from '../../components/ui/Skeletons';

export default function QuotePage() {
  const { slug } = useParams();
  const [writing, setWriting] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiWritings.getBySlug(slug);
        setWriting(data.writing);
        setRelated(data.related || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleCopy = async () => {
    if (!writing) return;
    const authorName = writing.author_name || writing.author?.name || '';
    await copyToClipboard(`"${writing.text}"\n\n— ${authorName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!writing) return;
    const authorName = writing.author_name || writing.author?.name || '';
    const text = `"${writing.text}"\n\n— ${authorName}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Words by ${authorName}`, text }); } catch {}
    } else {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 text-center" aria-hidden="true">
          <Skeleton className="w-48 h-4 mx-auto mb-10" />
          <Skeleton className="w-full h-8 mb-4" />
          <Skeleton className="w-11/12 h-8 mb-4 mx-auto" />
          <Skeleton className="w-4/5 h-8 mb-10 mx-auto" />
          <Skeleton className="w-32 h-5 mx-auto mb-2" />
          <Skeleton className="w-44 h-4 mx-auto" />
        </div>
      </div>
    );
  }
  if (!writing) return <div className="pt-24 text-center font-body text-ink-400">Writing not found</div>;

  const authorName = writing.author_name || writing.author?.name || 'Unknown';
  const authorSlug = writing.author_slug || writing.author?.slug || '';
  const isRTL = writing.direction === 'rtl';
  const isBangla = writing.language === 'bangla';
  const saved = isFavorite(writing.id);

  return (
    <>
      <Helmet>
        <title>{`${writing.title || writing.text.substring(0, 60)} — The Poetry Archive`}</title>
        <meta name="description" content={writing.text.substring(0, 160)} />
        <meta property="og:title" content={writing.title || `Words by ${authorName}`} />
        <meta property="og:description" content={writing.text.substring(0, 160)} />
      </Helmet>

      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Writing */}
            <article className="mb-20">
              {writing.title && (
                <h1 className="font-display text-2xl md:text-3xl text-ink-100 mb-8 text-center">
                  {writing.title}
                </h1>
              )}

              <blockquote className={`text-center mb-12 ${isRTL ? 'writing-rtl' : ''}`}>
                <p className={`${isBangla ? 'font-bangla' : 'font-display'} text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-ink-100 italic whitespace-pre-line`}>
                  {writing.text}
                </p>
              </blockquote>

              <div className="flex flex-col items-center gap-5 mb-12">
                {/* Author signature */}
                <div className="flex items-center justify-center gap-4 w-full">
                  <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-gold-500/40" />
                  <div className="text-center">
                    {authorSlug ? (
                      <Link to={`/authors/${authorSlug}`} className="font-brand text-lg text-gold-400 hover:text-gold-300 transition-colors">
                        — {authorName} —
                      </Link>
                    ) : (
                      <span className="font-brand text-lg text-gold-400">— {authorName} —</span>
                    )}
                  </div>
                  <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-gold-500/40" />
                </div>

                {/* Metadata line */}
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-ink-500 text-center">
                  {writing.source && (
                    <span className="font-body text-xs italic">{writing.source}</span>
                  )}
                  {writing.date && (
                    <>
                      {writing.source && <span className="text-ink-700">·</span>}
                      <span className="font-body text-xs">{writing.date}</span>
                    </>
                  )}
                  {writing.type && (
                    <>
                      <span className="text-ink-700">·</span>
                      <span className="font-body text-xs capitalize">{writing.type}</span>
                    </>
                  )}
                  {writing.language && (
                    <>
                      <span className="text-ink-700">·</span>
                      <span className="font-body text-xs capitalize">{writing.language}</span>
                    </>
                  )}
                  {writing.verification_status && (
                    <>
                      <span className="text-ink-700">·</span>
                      <span className={`font-body text-xs capitalize inline-flex items-center gap-1.5 ${
                        writing.verification_status === 'verified'
                          ? 'text-emerald-400'
                          : writing.verification_status === 'attributed'
                          ? 'text-amber-400'
                          : 'text-ink-500'
                      }`}>
                        {writing.verification_status === 'verified' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                        {writing.verification_status}
                      </span>
                    </>
                  )}
                </div>

                {/* Categories */}
                {writing.categories?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 -mx-2">
                    {writing.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/explore?category=${cat.slug}`}
                        className="font-body text-xs text-ink-400 hover:text-gold-400 underline underline-offset-4 decoration-ink-700 hover:decoration-gold-500/50 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Translations */}
                {writing.english_translation && writing.language !== 'english' && (
                  <div className="mt-8 p-6 bg-ink-900/30 border border-ink-800/30 rounded-sm max-w-2xl">
                    <span className="font-body text-xs text-ink-500 uppercase tracking-wider block mb-3">English Translation</span>
                    <p className="font-display text-lg italic text-ink-200 leading-relaxed whitespace-pre-line">
                      {writing.english_translation}
                    </p>
                  </div>
                )}

                {writing.bangla_translation && (
                  <div className="mt-4 p-6 bg-ink-900/30 border border-ink-800/30 rounded-sm max-w-2xl">
                    <span className="font-body text-xs text-ink-500 uppercase tracking-wider block mb-3">Bangla Translation</span>
                    <p className="font-bangla text-lg italic text-ink-200 leading-relaxed whitespace-pre-line">
                      {writing.bangla_translation}
                    </p>
                  </div>
                )}

                {/* Source info */}
                {(writing.translator || writing.source_book || writing.source_url) && (
                  <div className="mt-6 text-center">
                    {writing.translator && (
                      <p className="font-body text-xs text-ink-500">Translated by {writing.translator}</p>
                    )}
                    {writing.source_book && (
                      <p className="font-body text-xs text-ink-600 mt-1">From: {writing.source_book}</p>
                    )}
                    {writing.source_url && (
                      <a href={writing.source_url} target="_blank" rel="noopener noreferrer" className="font-body text-xs text-gold-500/60 hover:text-gold-400 transition-colors mt-1 inline-block">
                        Source ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4">
                <button onClick={handleCopy} className="btn-ghost flex items-center gap-2">
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <button onClick={handleShare} className="btn-ghost flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
                <button onClick={() => toggleFavorite(writing.id)} className={`btn-ghost flex items-center gap-2 ${saved ? 'text-gold-400' : ''}`}>
                  <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </article>

            {/* Related */}
            {related.length > 0 && (
              <section>
                <h2 className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-8 text-center">
                  Related Words
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {related.map((w, i) => (
                    <QuoteCard key={w.id} writing={w} index={i} />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
