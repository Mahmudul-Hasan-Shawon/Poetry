import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/authors', label: 'Authors' },
  { to: '/collections', label: 'Collections' },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Reset scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogoClick = (e) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-ink-950 relative">
      <div className="grain-overlay" />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div
          className={`absolute inset-0 -z-10 bg-ink-950/40 backdrop-blur-md transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
<Link to="/" onClick={handleLogoClick} className="flex items-center group">
              <img
                src="/Images/logo/logo.svg"
                alt="The Poetry Archive"
                className="h-12 w-auto object-contain"
              />
            </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-sm tracking-wide transition-colors duration-300 ${
                  location.pathname === link.to
                    ? 'text-gold-400'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/search"
              className="text-ink-400 hover:text-gold-400 transition-colors duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-ink-400 hover:text-ink-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 md:hidden bg-ink-950 flex flex-col overflow-y-auto"
            >
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col items-center gap-1 px-8">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 24 }}
                      transition={{ delay: 0.06 * i }}
                    >
                      <Link
                        to={link.to}
                        className={`block font-display text-4xl py-3 transition-colors duration-300 ${
                          location.pathname === link.to
                            ? 'text-gold-400'
                            : 'text-ink-200 hover:text-gold-400'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ delay: 0.06 * navLinks.length + 0.05 }}
                  >
                    <Link
                      to="/search"
                      className="block font-body text-lg text-ink-400 hover:text-gold-400 mt-6 transition-colors duration-300"
                    >
                      Search
                    </Link>
                  </motion.div>
                </div>
              </div>

              <div className="mt-10 space-y-7 pb-10 px-8">
                <div className="flex flex-col items-center gap-2.5">
                  <a
                    href="mailto:info@thepoetryarchive.com"
                    className="inline-flex items-center gap-2.5 text-sm text-ink-400 hover:text-ink-100 transition-colors duration-300 w-fit"
                  >
                    <i className="fa-regular fa-envelope text-gold-500/80" aria-hidden="true"></i>
                    info@thepoetryarchive.com
                  </a>
                  <div className="inline-flex items-center gap-2.5 text-sm text-ink-400 w-fit">
                    <i className="fa-solid fa-location-dot text-gold-500/80" aria-hidden="true"></i>
                    Dhaka, Bangladesh
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 border-t border-ink-800 pt-6">
                  <div className="flex gap-2.5">
                    <a
                      href="https://x.com/mhshan7"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X"
                      className="w-10 h-10 rounded-full border border-ink-700 flex items-center justify-center text-ink-500 transition-all duration-300 hover:border-gold-500/50 hover:text-gold-400 hover:bg-gold-500/10 hover:-translate-y-0.5"
                    >
                      <i className="fa-brands fa-x-twitter" aria-hidden="true"></i>
                    </a>
                    <a
                      href="https://wa.me/8801874460244"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      className="w-10 h-10 rounded-full border border-ink-700 flex items-center justify-center text-ink-500 transition-all duration-300 hover:border-gold-500/50 hover:text-gold-400 hover:bg-gold-500/10 hover:-translate-y-0.5"
                    >
                      <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                    </a>
                    <a
                      href=""
                      aria-label="Facebook"
                      className="w-10 h-10 rounded-full border border-ink-700 flex items-center justify-center text-ink-500 transition-all duration-300 hover:border-gold-500/50 hover:text-gold-400 hover:bg-gold-500/10 hover:-translate-y-0.5"
                    >
                      <i className="fa-brands fa-facebook" aria-hidden="true"></i>
                    </a>
                    <a
                      href="https://instagram.com/mhshan7"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-10 h-10 rounded-full border border-ink-700 flex items-center justify-center text-ink-500 transition-all duration-300 hover:border-gold-500/50 hover:text-gold-400 hover:bg-gold-500/10 hover:-translate-y-0.5"
                    >
                      <i className="fa-brands fa-instagram" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-500 hover:text-ink-200 cursor-pointer transition-colors duration-300">
                    Privacy Policy
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-500 hover:text-ink-200 cursor-pointer transition-colors duration-300">
                    Terms of Service
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-500 hover:text-ink-200 cursor-pointer transition-colors duration-300">
                    Cookie Policy
                  </span>
                  <span className="text-ink-600 text-xs">© 2026 Shawon</span>
                  <span className="text-ink-500 text-xs flex items-center gap-1.5">
                    Powered by
                    <a href="https://mhshan.pages.dev/" target="_blank" rel="noopener" className="inline-flex items-center hover:opacity-80 transition-opacity">
                      <img
                        src="/Images/logo/shawon_logo.svg"
                        alt="Shawon"
                        className="h-6 w-auto object-contain"
                      />
                    </a>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      <main className="relative z-10">
        <Outlet />
      </main>

      <footer className="relative z-10 overflow-hidden mt-16">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 border-t border-ink-800/30 pt-16">
            <div>
              <div className="flex items-center mb-5">
                <img
                  src="/Images/logo/logo.svg"
                  alt="The Poetry Archive"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="font-body text-sm text-ink-500 leading-relaxed max-w-xs">
                A quiet digital library of human thought. Poetry, wisdom, and writings from the world's greatest poets and thinkers.
              </p>
              <div className="flex items-center gap-2 mt-5">
                <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-body text-sm text-ink-400">Dhaka, Bangladesh</span>
              </div>
            </div>

            <div>
              <h3 className="font-body text-xs uppercase tracking-widest text-gold-500 mb-5">Explore</h3>
              <div className="space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block font-body text-sm text-ink-400 hover:text-gold-400 transition-colors duration-300 w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/search"
                  className="block font-body text-sm text-ink-400 hover:text-gold-400 transition-colors duration-300 w-fit"
                >
                  Search
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-body text-xs uppercase tracking-widest text-gold-500 mb-5">About</h3>
              <p className="font-body text-sm text-ink-500 leading-relaxed">
                Dedicated to preserving the timeless words of poets, philosophers, and thinkers across cultures and centuries — a home for quiet reflection and enduring verse.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-ink-800/30">
            <div className="flex flex-col items-center">
              <div className="social-row">
                <a href="https://x.com/mhshan7" target="_blank" rel="noopener" title="X" aria-label="X">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
                <a href="https://wa.me/8801874460244" target="_blank" rel="noopener" title="WhatsApp" aria-label="WhatsApp">
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
                <a href="" target="_blank" rel="noopener" title="facebook" aria-label="facebook">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="https://instagram.com/mhshan7" target="_blank" rel="noopener" title="instagram" aria-label="instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1 mt-6">
                <p className="font-body text-xs text-ink-600">
                  © 2026 — Shawon. All rights reserved.
                </p>
                <span className="hidden sm:inline text-ink-700">·</span>
                <p className="font-body text-xs text-ink-600 flex items-center gap-1.5">
                  Powered by
                  <a href="https://mhshan.pages.dev/" target="_blank" rel="noopener" className="inline-flex items-center hover:opacity-80 transition-opacity">
<img
                    src="/Images/logo/shawon_logo.svg"
                    alt="Shawon"
                    className="h-8 w-auto object-contain"
                  />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
