import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiWritings, apiAuthors } from '../../api/client';
import QuoteCard from '../../components/quotes/QuoteCard';

export default function HomePage() {
  const [daily, setDaily] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomLoading, setRandomLoading] = useState(false);
  const [randomWriting, setRandomWriting] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [dailyRes, featuredRes, authorsRes] = await Promise.all([
          apiWritings.daily(),
          apiWritings.featured(),
          apiAuthors.list(),
        ]);
        setDaily(dailyRes);
        setFeatured(featuredRes);
        setAuthors(authorsRes);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDiscover = async () => {
    setRandomLoading(true);
    try {
      const writing = await apiWritings.random();
      setRandomWriting(writing);
    } catch {}
    setRandomLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet="/Images/hero/hero-wide-3840w.webp 3840w, /Images/hero/hero-wide-2560w.webp 2560w, /Images/hero/hero-wide-1920w.webp 1920w"
              sizes="100vw"
              type="image/webp"
            />
            <source
              media="(min-width: 768px)"
              srcSet="/Images/hero/hero-wide-2560w.jpg"
              sizes="100vw"
              type="image/jpeg"
            />
            <source srcSet="/Images/hero/hero-mobile-1080x1920.webp" type="image/webp" />
            <source srcSet="/Images/hero/hero-mobile-1080x1920.jpg" type="image/jpeg" />
            <img src="/Images/hero/hero-wide-2560w.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/80 to-ink-950" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-600/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="mb-8">
              <span className="inline-block font-body text-xs uppercase tracking-[0.3em] text-gold-500/70 mb-6">
                A Quiet Digital Library
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-ink-100 leading-[1.1] mb-8">
              Words That
              <br />
              <span className="italic text-gold-400">Outlive</span> Time
            </h1>

            <p className="font-body text-lg md:text-xl text-ink-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Poetry, wisdom, and writings from the world's greatest poets and thinkers.
              <br className="hidden md:block" />
              A place for quiet contemplation and literary discovery.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/explore" className="btn-primary">
                Explore the Archive
              </Link>
              <button onClick={handleDiscover} className="btn-secondary" disabled={randomLoading}>
                {randomLoading ? 'Finding...' : 'Discover a Thought'}
              </button>
            </div>
          </motion.div>

          {/* Random writing popup */}
          {randomWriting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 max-w-xl mx-auto"
            >
              <div className="p-8 bg-ink-900/40 border border-ink-800/30 rounded-sm">
                <p className={`${randomWriting.language === 'bangla' ? 'font-bangla' : 'font-display'} text-lg md:text-xl italic text-ink-200 leading-relaxed mb-4 whitespace-pre-line`}>
                  {randomWriting.text}
                </p>
                <p className="font-body text-sm text-gold-400">
                  {randomWriting.author_name || 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => setRandomWriting(null)}
                className="mt-4 font-body text-xs text-ink-500 hover:text-ink-300 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="w-5 h-5 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Word of the Day */}
      {daily && (
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-8 block">
                Word of the Day
              </span>

              <blockquote className={`${daily.language === 'bangla' ? 'font-bangla' : 'font-display'} text-2xl md:text-4xl lg:text-5xl font-light leading-relaxed text-ink-100 mb-8 ${daily.direction === 'rtl' ? 'writing-rtl' : ''}`}>
                <span className="text-gold-500/30 text-6xl">"</span>
                <span className="italic whitespace-pre-line">{daily.text}</span>
                <span className="text-gold-500/30 text-6xl">"</span>
              </blockquote>

              <div className="flex items-center justify-center gap-3">
                {daily.author_slug ? (
                  <Link to={`/authors/${daily.author_slug}`} className="font-body text-lg text-gold-400 hover:text-gold-300 transition-colors">
                    {daily.author_name}
                  </Link>
                ) : (
                  <span className="font-body text-lg text-gold-400">{daily.author_name}</span>
                )}
              </div>

              {daily.source && (
                <p className="font-body text-sm text-ink-500 mt-2">{daily.source}</p>
              )}

              <div className="mt-8">
                <Link to={`/quotes/${daily.slug}`} className="btn-ghost text-gold-500/60 hover:text-gold-400">
                  Read in full →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Writings */}
      {featured.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
                Featured Words
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-light text-ink-100">
                Selected Writings
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 9).map((writing, i) => (
                <QuoteCard key={writing.id} writing={writing} index={i} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/explore" className="btn-secondary">
                View All Writings
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Authors Preview */}
      {authors.length > 0 && (
        <section className="py-24 px-6 bg-ink-900/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
                Voices Across Time
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-light text-ink-100">
                Our Authors
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {authors.slice(0, 10).map((author, i) => (
                <motion.div
                  key={author.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    to={`/authors/${author.slug}`}
                    className="block text-center group p-6 rounded-sm border border-ink-800/30 hover:border-gold-500/30 transition-all duration-500"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center border border-gold-500/20 group-hover:border-gold-500/40 transition-colors">
                      <span className="font-display text-xl text-gold-400">
                        {author.name[0]}
                      </span>
                    </div>
                    <h3 className="font-display text-lg text-ink-100 group-hover:text-gold-400 transition-colors mb-1">
                      {author.name}
                    </h3>
                    <p className="font-body text-xs text-ink-500">
                      {author.writing_count} {author.writing_count === 1 ? 'writing' : 'writings'}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/authors" className="btn-secondary">
                All Authors
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
