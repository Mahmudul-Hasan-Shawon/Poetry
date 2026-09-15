import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

const processSteps = [
  {
    step: '01',
    title: 'Kept carefully',
    body: 'Every writing is verified, attributed and organized by author, language, category and collection. Nothing lost to a chat history or a camera roll.',
  },
  {
    step: '02',
    title: 'Found easily',
    body: 'Powerful search and thoughtful filters let you find the right words at the right moment, instead of scrolling past them forever.',
  },
  {
    step: '03',
    title: 'Read slowly',
    body: 'A quiet, focused reading experience. No noise, no clutter, just the writing, the author and the moment it was meant for.',
  },
  {
    step: '04',
    title: 'Shared generously',
    body: 'Words are meant to travel. Discoveries, favorites and daily thoughts are shared warmly between friends, the way good poetry always has been.',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
            About
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink-100 mb-4">
            The human behind the archive
          </h1>
          <p className="font-body text-ink-400 max-w-lg mx-auto">
            A short introduction to the person curating this quiet digital library of human thought.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-md mx-auto lg:mx-0 w-full"
          >
            <figure className="relative">
              <div className="relative rounded-sm border border-ink-800/50 overflow-hidden bg-ink-900/30">
                <img
                  src="/Images/about/shan_2_no_bg.png"
                  alt="Mahmudul Hasan Shawon"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/95 via-ink-950/70 to-transparent px-6 pt-12 pb-5">
                  <p className="font-display text-xl text-ink-100">Mahmudul Hasan Shawon</p>
                  <p className="font-body text-sm text-ink-300 flex items-center gap-2 mt-1.5">
                    <i className="fa-solid fa-location-dot text-gold-500/80" aria-hidden="true"></i>
                    Dhaka, Bangladesh
                  </p>
                </figcaption>
              </div>
            </figure>
          </motion.div>

          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="font-display text-xl md:text-2xl font-light text-ink-100 leading-relaxed mb-8"
            >
              I have always loved reading, especially poetry, verses, and quotes that make me pause and think.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
              className="space-y-5 mb-12"
            >
              <p className="font-body text-base text-ink-400 leading-relaxed">
                Whenever I come across something that inspires me on Facebook, Instagram, or other social platforms, I usually save it in my notes or take a screenshot, thinking that I'll come back to it someday.
              </p>
              <p className="font-body text-base text-ink-400 leading-relaxed">
                But, over time, those notes and screenshots became a huge, messy collection. The things I loved slowly got buried beneath everything else, and most of the time, I never opened them again.
              </p>
              <p className="font-body text-base text-ink-400 leading-relaxed">
                That made me think: what if there were a simple, beautiful place where I could keep all the words that mean something to me? So, I decided to create this. It is not just a collection of poetry and quotes. It is a personal archive of words that have inspired me, touched me, or stayed with me for some reason. A place where meaningful words don't have to disappear into a crowded notes app, a forgotten screenshot folder, or an old social-media post.
              </p>
              <p className="font-body text-base text-ink-400 leading-relaxed">
                There is another personal reason behind this project too. One of my closest friends, Noushad, is an incredibly versatile and talented person. He writes beautifully, and over the years, he has shared many of his writings with me through social media and chat. I saved many of them because I genuinely loved reading them. But, like everything else, they slowly became lost among our old conversations and countless messages.
              </p>
              <p className="font-body text-base text-ink-400 leading-relaxed">
                So, in a small way, this project is also dedicated to him. Perhaps this is what I wanted all along, a quiet place for words worth remembering. Words that inspire. Words that comfort. Words that make us think. Because some words deserve more than a screenshot. They deserve a place to stay.
              </p>
            </motion.div>

            <motion.blockquote
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
              className="border-l-2 border-gold-500/60 pl-6 mb-12"
            >
              <p className="font-display text-xl md:text-2xl font-light text-ink-100 leading-relaxed">
                A line of poetry, kept and revisited, becomes a friend you can lean on.
              </p>
              <cite className="font-body text-sm text-gold-500/70 not-italic mt-3 block">— Shawon</cite>
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26, ease: EASE }}
              className="flex flex-wrap items-center gap-4"
            >
                <a
                  href="/explore"
                  className="btn-primary text-sm inline-flex items-center gap-2"
                >
                  Start reading
                  <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
              <Link
                to="/"
                className="btn-ghost text-sm inline-flex items-center gap-2"
              >
                Take me home
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}