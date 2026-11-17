import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import HomePage from './pages/HomePage'
import GiftsPage from './pages/GiftsPage'

/**
 * Automatically scrolls to top on route change.
 */
function ScrollToTopOnMount() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/**
 * Backward compatibility: Redirects old hash links (e.g. /#gifts) to the dedicated /gifts route.
 */
function HashRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    if (window.location.hash.toLowerCase().includes('gift')) {
      navigate('/gifts', { replace: true })
    }
  }, [navigate])
  return null
}

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isGifts = location.pathname.startsWith('/gifts')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Floating scroll-to-top threshold
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavToRSVP = () => {
    if (isGifts) {
      navigate('/')
      setTimeout(() => {
        document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    } else {
      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-teal-forest text-ivory selection:bg-champagne/30 selection:text-champagne-light overflow-x-hidden">
      {/* Floating Monogram Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-teal-deep/85 backdrop-blur-md border-b border-champagne/20 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <img
              src="/favicon.svg"
              alt="O◈T Monogram"
              className="w-11 h-11 rounded-full shadow-gold-sm transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <span className="font-display text-sm tracking-widest uppercase text-champagne block">
                Oluwatobi &amp; Temitope
              </span>
              <span className="font-serif italic text-xs text-ivory/70 block">
                21st November &bull; Lagos
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-sans tracking-widest uppercase text-ivory/80">
            {!isGifts ? (
              <>
                <a href="#our-story" className="hover:text-champagne transition-colors">Our Story</a>
                <a href="#groom-letter" className="hover:text-champagne transition-colors">Groom's Letter</a>
                <a href="#ceremony" className="hover:text-champagne transition-colors">Ceremony</a>
                <a href="#gallery" className="hover:text-champagne transition-colors">Moments</a>
                <a href="#rsvp" className="hover:text-champagne transition-colors">RSVP</a>
                <Link
                  to="/gifts"
                  className="px-4 py-2 rounded-full border border-champagne bg-champagne/15 text-champagne hover:bg-champagne hover:text-teal-deep transition-all duration-300 font-semibold shadow-gold-sm cursor-pointer"
                >
                  Cash Gifts
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="hover:text-champagne transition-colors cursor-pointer"
                >
                  &larr; Back to Home
                </Link>
                <span className="text-champagne font-semibold border-b border-champagne pb-0.5">
                  Cash Gifts
                </span>
                <button
                  type="button"
                  onClick={handleNavToRSVP}
                  className="px-4 py-2 rounded-full border border-champagne bg-champagne/15 text-champagne hover:bg-champagne hover:text-teal-deep transition-all duration-300 font-semibold shadow-gold-sm cursor-pointer"
                >
                  RSVP
                </button>
              </>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-2">
            {!isGifts ? (
              <Link
                to="/gifts"
                className="px-3 py-1.5 rounded-full border border-champagne text-[11px] font-sans uppercase tracking-widest text-champagne"
              >
                Cash Gifts
              </Link>
            ) : (
              <Link
                to="/"
                className="px-3 py-1.5 rounded-full border border-champagne text-[11px] font-sans uppercase tracking-widest text-champagne"
              >
                Home
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Routes Outlet */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gifts" element={<GiftsPage />} />
          <Route path="/gift" element={<Navigate to="/gifts" replace />} />
          <Route path="/registry" element={<Navigate to="/gifts" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ======================= SCROLL TO TOP BUTTON ======================= */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.6, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label="Scroll to top of page"
            title="Scroll to top"
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-teal-deep/90 hover:bg-champagne text-champagne hover:text-teal-deep border border-champagne/40 hover:border-champagne shadow-gold-md backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer group"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ======================= FOOTER ======================= */}
      <footer className="border-t border-champagne/20 py-12 px-6 text-center space-y-4 bg-teal-forest">
        <img
          src="/favicon.svg"
          alt="O◈T Monogram"
          className="w-12 h-12 rounded-full mx-auto shadow-gold-sm"
        />
        <h4 className="font-display text-lg text-champagne tracking-widest uppercase">
          Oluwatobi &amp; Temitope
        </h4>
        <p className="font-serif italic text-sm text-ivory/70 max-w-md mx-auto">
          "Love is patient, love is kind. It always protects, always trusts, always hopes, always perseveres."
        </p>
        <p className="text-xs font-serif text-ivory/50">
          Traditional Wedding Ceremony &bull; November 21st &bull; Lagos, Nigeria
        </p>
        <div className="pt-4 border-t border-champagne/10 text-[11px] font-sans text-ivory/40 space-y-1.5">
          <p>
            Created with Love for Oluwatobi Deborah &amp; Temitope Emmanuel &bull; &copy; 2026
          </p>
          <p className="text-[10px] text-ivory/25 tracking-wide">
            Powered by{' '}
            <a
              href="https://socialbusinessassistant.gabbyintelligence.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory/30 hover:text-champagne/70 transition-colors underline-offset-2 hover:underline"
            >
              GabbyIntelligence
            </a>
            <span className="mx-1.5 text-ivory/20">&bull;</span>
            <a
              href="https://www.instagram.com/gabbyintelligence/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory/30 hover:text-champagne/70 transition-colors underline-offset-2 hover:underline"
            >
              Instagram
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnMount />
      <HashRedirect />
      <Layout />
    </BrowserRouter>
  )
}
