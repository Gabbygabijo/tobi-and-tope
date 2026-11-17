import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  cardImage,
  WeddingIMG1,
  WeddingIMG2,
  WeddingIMG3,
  PictureWedding,
} from './assets/images'
import { sendRSVPEmail } from './services/emailjs'

const isGiftsUrl = (): boolean => {
  if (typeof window === 'undefined') return false
  const hash = (window.location.hash || '').toLowerCase()
  const pathname = (window.location.pathname || '').toLowerCase()
  const search = (window.location.search || '').toLowerCase()

  return (
    hash.includes('gift') ||
    hash.includes('registry') ||
    pathname.includes('gift') ||
    pathname.includes('registry') ||
    search.includes('gift') ||
    search.includes('registry')
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'gifts'>(() => {
    return isGiftsUrl() ? 'gifts' : 'home'
  })
  const [guestName, setGuestName] = useState('')
  const [attending, setAttending] = useState<'yes' | 'no'>('yes')
  const [guestCount, setGuestCount] = useState('1')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<'account' | 'full' | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Listen to hash and popstate changes for page routing
  useEffect(() => {
    const handleRouteChange = () => {
      if (isGiftsUrl()) {
        setCurrentPage('gifts')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setCurrentPage('home')
      }
    }

    window.addEventListener('hashchange', handleRouteChange)
    window.addEventListener('popstate', handleRouteChange)
    return () => {
      window.removeEventListener('hashchange', handleRouteChange)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  // Show scroll-to-top button after scrolling past hero
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

  const copyAccountNumber = () => {
    navigator.clipboard?.writeText('0774559702')
    setCopiedType('account')
    setTimeout(() => setCopiedType(null), 3000)
  }

  const copyFullDetails = () => {
    const text = `Access Bank\nAccount Number: 0774559702\nAccount Name: Oluwatobi Fasedemi\nTraditional Wedding of Oluwatobi & Temitope`
    navigator.clipboard?.writeText(text)
    setCopiedType('full')
    setTimeout(() => setCopiedType(null), 3000)
  }

  const navigateTo = (page: 'home' | 'gifts') => {
    if (page === 'gifts') {
      window.location.hash = 'gifts'
    } else {
      window.location.hash = ''
      if (window.location.pathname.toLowerCase().includes('gift')) {
        window.history.pushState(null, '', '/')
      }
    }
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Countdown timer to November 21st
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Target date: Nov 21, 2026, 13:00 (1 PM) WAT
    const targetDate = new Date('2026-11-21T13:00:00+01:00').getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmitRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await sendRSVPEmail({
        guestName: guestName.trim(),
        attending,
        guestCount,
        message,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      console.error('Failed to submit RSVP:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to send your RSVP right now. Please try again or reach out to the couple directly.'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-teal-forest text-ivory selection:bg-champagne/30 selection:text-champagne-light overflow-x-hidden">
      {/* Floating Monogram Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-teal-deep/85 backdrop-blur-md border-b border-champagne/20 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
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
          </button>

          <nav className="hidden md:flex items-center gap-7 text-xs font-sans tracking-widest uppercase text-ivory/80">
            {currentPage === 'home' ? (
              <>
                <a href="#our-story" className="hover:text-champagne transition-colors">Our Story</a>
                <a href="#groom-letter" className="hover:text-champagne transition-colors">Groom's Letter</a>
                <a href="#ceremony" className="hover:text-champagne transition-colors">Ceremony</a>
                <a href="#gallery" className="hover:text-champagne transition-colors">Moments</a>
                <a href="#rsvp" className="hover:text-champagne transition-colors">RSVP</a>
                <button
                  onClick={() => navigateTo('gifts')}
                  className="px-4 py-2 rounded-full border border-champagne bg-champagne/15 text-champagne hover:bg-champagne hover:text-teal-deep transition-all duration-300 font-semibold shadow-gold-sm cursor-pointer"
                >
                  Cash Gifts
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-champagne transition-colors cursor-pointer"
                >
                  &larr; Back to Home
                </button>
                <span className="text-champagne font-semibold border-b border-champagne pb-0.5">
                  Cash Gifts
                </span>
                <button
                  onClick={() => {
                    navigateTo('home')
                    setTimeout(() => {
                      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  className="px-4 py-2 rounded-full border border-champagne bg-champagne/15 text-champagne hover:bg-champagne hover:text-teal-deep transition-all duration-300 font-semibold shadow-gold-sm cursor-pointer"
                >
                  RSVP
                </button>
              </>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => navigateTo(currentPage === 'gifts' ? 'home' : 'gifts')}
              className="px-3 py-1.5 rounded-full border border-champagne text-[11px] font-sans uppercase tracking-widest text-champagne"
            >
              {currentPage === 'gifts' ? 'Home' : 'Cash Gifts'}
            </button>
          </div>
        </div>
      </header>

      {/* ======================= MAIN CONTENT / PAGE ROUTER ======================= */}
      <AnimatePresence mode="wait">
        {currentPage === 'gifts' ? (
          /* ======================= DEDICATED MONETARY GIFT PAGE ======================= */
          <motion.section
            key="gifts-page"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="pt-24 sm:pt-32 pb-20 sm:pb-28 min-h-[85vh] relative overflow-hidden bg-wedding-teal"
          >
            {/* Ambient Glows */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-150 h-150 bg-champagne/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-1/2 right-1/4 w-100 h-100 bg-teal-emerald/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative space-y-8 sm:space-y-12">
              {/* Top Navigation Back button */}
              <div className="flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('home')}
                  className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-champagne hover:text-champagne-light transition-colors cursor-pointer group py-1"
                >
                  <span className="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span>
                  <span>Return to Homepage</span>
                </motion.button>
                <div className="wedding-pill-badge text-[10px] sm:text-[11px] py-1 px-3">
                  <span>◈ Wedding Registry ◈</span>
                </div>
              </div>

              {/* Header Titles */}
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <h1 className="font-script text-4xl sm:text-6xl md:text-7xl text-ivory">
                  Monetary Gifts &amp; Blessings
                </h1>
                <div className="wedding-divider my-2">
                  <div className="wedding-divider-diamond"></div>
                </div>
                <p className="font-serif italic text-lg sm:text-2xl text-champagne font-normal">
                  "Thank you for coming to our wedding. We appreciate you."
                </p>
              </div>

              {/* Main Bank Account Parchment Card */}
              <div className="p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl bg-ivory text-teal-deep shadow-2xl border-2 border-champagne relative">
                {/* Monogram Seal */}
                <div className="absolute -top-6 right-6 sm:right-12">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-forest border-2 border-champagne shadow-lg flex items-center justify-center">
                    <img src="/favicon.svg" alt="O◈T Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Gracious Message requested by couple */}
                  <div className="space-y-2 sm:space-y-3 font-serif text-sm sm:text-lg text-teal-900/90 leading-relaxed">
                    <p>
                      Your presence, prayers, and celebratory joy as we unite as husband and wife mean everything to us.
                    </p>
                    <p className="font-semibold text-teal-deep text-base sm:text-lg">
                      For cash gifts kindly send to this account:
                    </p>
                  </div>

                  {/* The Luxury Bank Card */}
                  <div className="relative rounded-2xl bg-linear-to-br from-teal-deep via-teal-forest to-[#021815] text-ivory p-5 sm:p-7 border border-champagne/40 shadow-xl overflow-hidden">
                    {/* Subtle Background Rings */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border border-champagne/10 pointer-events-none"></div>
                    <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full border border-champagne/10 pointer-events-none"></div>

                    <div className="relative space-y-5 sm:space-y-6">
                      {/* Bank Header */}
                      <div className="flex items-center justify-between border-b border-champagne/20 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-champagne/20 border border-champagne/50 flex items-center justify-center text-champagne font-display font-bold text-xs">
                            BANK
                          </div>
                          <div>
                            <span className="font-display font-bold text-lg sm:text-xl text-ivory tracking-wide block">
                              Access Bank
                            </span>
                            <span className="font-sans text-[10px] tracking-widest uppercase text-champagne block">
                              Direct Bank Transfer &bull; Nigeria
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-champagne/15 border border-champagne/30 text-champagne text-[11px] font-mono font-bold">
                          NGN
                        </span>
                      </div>

                      {/* Account Number Box (Mobile-first Tap Target) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-sans tracking-widest uppercase text-ivory/70">
                          <span>Account Number</span>
                          <span className="text-champagne font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Tap to copy
                          </span>
                        </div>

                        {/* Interactive Tap-to-Copy Container */}
                        <motion.div
                          onClick={copyAccountNumber}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-1.5 ${
                            copiedType === 'account'
                              ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)]'
                              : 'bg-teal-forest/90 border-champagne/40 hover:border-champagne'
                          }`}
                        >
                          <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-champagne-light select-all">
                            0774559702
                          </span>
                          <span className="font-sans text-[11px] text-ivory/60 tracking-wider">
                            Access Bank &bull; Oluwatobi Fasedemi
                          </span>
                        </motion.div>

                        {/* Primary Full-Width Thumb-Friendly Mobile Copy Button */}
                        <motion.button
                          type="button"
                          onClick={copyAccountNumber}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.01 }}
                          className={`w-full py-4 px-5 rounded-2xl font-sans text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                            copiedType === 'account'
                              ? 'bg-emerald-600 text-white border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                              : 'bg-linear-to-r from-[#F7E7C4] via-[#D4AF67] to-[#B3883B] text-teal-deep border border-champagne-light hover:brightness-105'
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {copiedType === 'account' ? (
                              <motion.span
                                key="copied"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="flex items-center gap-2"
                              >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Copied to Clipboard! ✓</span>
                              </motion.span>
                            ) : (
                              <motion.span
                                key="copy"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="flex items-center gap-2"
                              >
                                <svg className="w-5 h-5 text-teal-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy Account Number</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {/* Secondary Action: Copy Full Details */}
                        <motion.button
                          type="button"
                          onClick={copyFullDetails}
                          whileTap={{ scale: 0.96 }}
                          className="w-full py-3 px-4 rounded-xl border border-champagne/30 bg-teal-forest/50 hover:bg-teal-forest text-champagne text-xs font-sans font-medium tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <span>
                            {copiedType === 'full' ? '✓ Full Bank Info Copied!' : 'Copy Full Details (for WhatsApp / Banking App)'}
                          </span>
                        </motion.button>
                      </div>

                      {/* Account Name */}
                      <div className="space-y-1 pt-1 border-t border-champagne/20">
                        <span className="text-[11px] font-sans tracking-widest uppercase text-ivory/60 block">
                          Account Name
                        </span>
                        <div className="font-serif text-lg sm:text-xl font-bold text-ivory tracking-wide">
                          Oluwatobi Fasedemi
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Heartfelt Note from the Couple */}
                  <div className="pt-6 border-t border-champagne/30 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-champagne shadow-md shrink-0">
                      <img src={WeddingIMG1} alt="Tobi &amp; Tope" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <p className="font-serif italic text-sm sm:text-base text-teal-muted">
                        "May God bless you richly for every prayer, hug, and blessing you pour into our new beginning."
                      </p>
                      <span className="font-script text-2xl text-teal-deep block">
                        Oluwatobi &amp; Temitope
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 sm:pt-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="btn-teal w-full sm:w-auto text-center cursor-pointer"
                >
                  &larr; Back to Wedding Ceremony
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    navigateTo('home')
                    setTimeout(() => {
                      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  className="btn-gold w-full sm:w-auto text-center cursor-pointer"
                >
                  Confirm Attendance / RSVP
                </motion.button>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ======================= HERO SECTION ======================= */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 bg-teal-emerald/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/4 w-87.5 h-87.5 bg-champagne/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
          {/* Announcement Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-champagne/40 bg-teal-deep/60 backdrop-blur-sm text-champagne text-xs font-serif tracking-widest uppercase shadow-gold-sm animate-fade-in">
            <span>◈</span> The Traditional Wedding Celebration <span>◈</span>
          </div>

          {/* Couple's Names in Calligraphy */}
          <div className="space-y-3">
            <h1 className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-ivory tracking-wide leading-none drop-shadow-md">
              Oluwatobi
            </h1>
            <div className="flex items-center justify-center gap-4 my-2">
              <span className="h-px w-12 sm:w-20 bg-linear-to-r from-transparent to-champagne"></span>
              <span className="font-script text-4xl sm:text-5xl text-champagne leading-none">&amp;</span>
              <span className="h-px w-12 sm:w-20 bg-linear-to-l from-transparent to-champagne"></span>
            </div>
            <h1 className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-ivory tracking-wide leading-none drop-shadow-md">
              Temitope
            </h1>
          </div>

          <p className="font-serif italic text-lg sm:text-2xl text-ivory/80 max-w-2xl mx-auto">
            "Two souls destined by grace, united in love, embarking on an eternal journey together."
          </p>

          {/* Countdown Clock Bar */}
          <div className="max-w-xl mx-auto pt-4 pb-2">
            <div className="grid grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-teal-deep/70 border border-champagne/30 backdrop-blur-md shadow-card">
              <div className="text-center">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-champagne block">
                  {timeLeft.days}
                </span>
                <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-ivory/70">
                  Days
                </span>
              </div>
              <div className="text-center border-l border-champagne/20">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-champagne block">
                  {timeLeft.hours}
                </span>
                <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-ivory/70">
                  Hours
                </span>
              </div>
              <div className="text-center border-l border-champagne/20">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-champagne block">
                  {timeLeft.minutes}
                </span>
                <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-ivory/70">
                  Minutes
                </span>
              </div>
              <div className="text-center border-l border-champagne/20">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-champagne block">
                  {timeLeft.seconds}
                </span>
                <span className="font-sans text-[10px] sm:text-xs tracking-widest uppercase text-ivory/70">
                  Seconds
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#rsvp" className="btn-gold w-full sm:w-auto text-center">
              RSVP &bull; Confirm Attendance
            </a>
            <a href="#groom-letter" className="btn-teal w-full sm:w-auto text-center">
              Read Groom's Letter
            </a>
          </div>

          {/* Hero Featured Arched Portrait */}
          <div className="pt-10 max-w-lg mx-auto relative">
            <div className="relative p-2 rounded-t-[180px] rounded-b-[36px] bg-linear-to-b from-champagne via-champagne/40 to-teal-forest border border-champagne/60 shadow-2xl">
              <div className="relative rounded-t-[174px] rounded-b-[30px] overflow-hidden border border-champagne/30 aspect-4/5 bg-teal-deep">
                <img
                  src={WeddingIMG3}
                  alt="Oluwatobi and Temitope in formal ivory"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Floating Date Badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="wedding-pill-badge shadow-gold">
                <span>◈ Saturday, 21st November 2026 ◈</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= OUR LOVE STORY SECTION ======================= */}
      <section id="our-story" className="py-24 bg-teal-deep/50 border-y border-champagne/20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="font-serif italic text-champagne text-base sm:text-lg block">
              How Forever Began
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory font-normal tracking-wide">
              Our Love Story
            </h2>
            <div className="wedding-divider">
              <div className="wedding-divider-diamond"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Story Text */}
            <div className="space-y-6 font-serif text-base sm:text-lg text-ivory/85 leading-relaxed">
              <p className="text-xl sm:text-2xl text-champagne font-normal italic leading-relaxed">
                "In a world of billions, our paths converged with the effortless beauty of destiny."
              </p>
              <p>
                From the very beginning, what bonded Oluwatobi and Temitope was an effortless friendship, an unwavering sense of peace, and laughter that made even ordinary days feel like celebrations.
              </p>
              <p>
                They discovered that true love isn't just about gazing at one another, but looking outward together in the same direction — leaning on shared faith, honoring their families, and cherishing the quiet everyday moments.
              </p>
              <p>
                Today, as they step forward into traditional matrimony, they celebrate not just the journey that brought them here, but the lifelong covenant they are building hand in hand.
              </p>

              <div className="pt-4 border-t border-champagne/20 flex items-center gap-6">
                <div>
                  <span className="font-display text-xs uppercase tracking-widest text-champagne block">
                    Bride
                  </span>
                  <span className="font-serif font-bold text-ivory text-lg">
                    Oluwatobi Deborah
                  </span>
                </div>
                <div className="text-champagne font-serif text-2xl">&bull;</div>
                <div>
                  <span className="font-display text-xs uppercase tracking-widest text-champagne block">
                    Groom
                  </span>
                  <span className="font-serif font-bold text-ivory text-lg">
                    Temitope Emmanuel
                  </span>
                </div>
              </div>
            </div>

            {/* Romantic Side-by-Side Images */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-champagne/40 shadow-card aspect-3/4 bg-teal-deep">
                  <img
                    src={WeddingIMG2}
                    alt="Tobi and Tope laughing together"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => setSelectedPhoto(WeddingIMG2)}
                  />
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-center text-ivory/70">
                  "Laughter that feels like home"
                </p>
              </div>

              <div className="space-y-3 pt-8 sm:pt-12">
                <div className="rounded-2xl overflow-hidden border border-champagne/40 shadow-card aspect-3/4 bg-teal-deep">
                  <img
                    src={PictureWedding}
                    alt="Tobi and Tope smiling warmly"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => setSelectedPhoto(PictureWedding)}
                  />
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-center text-ivory/70">
                  "In your smile, I see forever"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= GROOM'S LETTER SECTION ======================= */}
      <section id="groom-letter" className="py-24 relative overflow-hidden bg-wedding-teal">
        {/* Soft Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-champagne/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="font-serif italic text-champagne text-base sm:text-lg block">
              Words From The Heart
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory font-normal tracking-wide">
              A Letter From The Groom
            </h2>
            <div className="wedding-divider">
              <div className="wedding-divider-diamond"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Groom and Bride Intimate Photo */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative mx-auto max-w-sm">
                {/* Arch outline behind photo */}
                <div className="absolute -inset-2 rounded-t-[160px] rounded-b-2xl border border-champagne/40 -z-10 translate-x-2 translate-y-2 pointer-events-none"></div>
                <div className="rounded-t-[150px] rounded-b-xl overflow-hidden border-2 border-champagne shadow-2xl aspect-3/4 bg-teal-deep">
                  <img
                    src={WeddingIMG1}
                    alt="Oluwatobi resting on Temitope's back"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 cursor-pointer"
                    onClick={() => setSelectedPhoto(WeddingIMG1)}
                  />
                </div>
                <div className="text-center mt-4">
                  <span className="font-serif italic text-sm text-champagne-light">
                    "Finding home in your embrace."
                  </span>
                </div>
              </div>
            </div>

            {/* The Groom's Letter Parchment Card */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="p-8 sm:p-12 rounded-3xl bg-ivory text-teal-deep relative shadow-2xl border-2 border-champagne">
                {/* Monogram Stamp / Wax Seal Element */}
                <div className="absolute -top-7 right-8 sm:right-12">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-champagne-300 via-champagne to-champagne-dark border-2 border-ivory shadow-lg flex items-center justify-center text-teal-deep font-display font-bold text-xs tracking-wider">
                    O◈T
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="font-sans text-xs tracking-widest uppercase text-champagne-dark font-semibold block mb-1">
                      A Vow of Love &amp; Devotion
                    </span>
                    <h3 className="font-script text-4xl sm:text-5xl text-teal-deep font-normal">
                      To My Lover,
                    </h3>
                  </div>

                  {/* Letter Body */}
                  <div className="space-y-4 font-serif text-base sm:text-lg text-teal-900/90 leading-relaxed">
                    <p>
                      Sometimes, I wonder how I got so lucky to have you in my life. You have become such a beautiful part of my world, and the thought of spending the rest of my life with you is something that fills my heart with so much joy.
                    </p>
                    <p>
                      I know that love is more than the beautiful moments we share. It is choosing each other every day, standing together through uncertainty, growing together, and finding way back to each other no matter what life brings. And you are the person I want to do all of that with.
                    </p>
                    <p>
                      I may not always have the perfect words to express how much you mean to me, but I hope my actions, my commitment, and the life we build together will always remind you that you are loved, valued, and chosen.
                    </p>
                  </div>

                  {/* Groom Sign-off */}
                  <div className="pt-6 border-t border-champagne/40 flex items-center justify-between">
                    <div>
                      <span className="font-script text-3xl sm:text-4xl text-teal-deep block leading-tight">
                        Temitope
                      </span>
                      <span className="font-sans text-xs uppercase tracking-widest text-teal-muted font-semibold">
                        Your Groom Forever
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-champagne-dark">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= CEREMONY & INVITATION SECTION ======================= */}
      <section id="ceremony" className="py-24 bg-teal-forest border-t border-champagne/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="font-serif italic text-champagne text-base sm:text-lg block">
              Join Our Celebration
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory font-normal tracking-wide">
              The Traditional Wedding Ceremony
            </h2>
            <div className="wedding-divider">
              <div className="wedding-divider-diamond"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Digital Arch Card Replica */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="wedding-arch-card p-8 sm:p-12 text-center text-teal-deep max-w-md w-full relative">
                {/* Monogram Badge */}
                <div className="mx-auto mb-6 flex justify-center">
                  <div className="monogram-badge">
                    <span className="font-serif text-3xl font-bold text-teal-deep">O</span>
                    <span className="font-serif text-2xl font-bold text-champagne translate-x-1 translate-y-1">T</span>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-xs tracking-widest uppercase text-teal-deep mb-2">
                  The Fasedemi and Kareem Families
                </h3>
                <p className="font-serif italic text-teal-muted text-sm mb-6">
                  Invite you to the traditional wedding of their daughter and son
                </p>

                <div className="space-y-1 mb-6">
                  <h4 className="font-script text-5xl text-teal-deep font-normal leading-tight">
                    Oluwatobi
                  </h4>
                  <p className="font-serif text-xs uppercase tracking-widest text-teal-deep font-semibold">
                    Deborah
                  </p>
                  <div className="font-script text-3xl text-champagne leading-none py-1">
                    &amp;
                  </div>
                  <h4 className="font-script text-5xl text-teal-deep font-normal leading-tight">
                    Temitope
                  </h4>
                  <p className="font-serif text-xs uppercase tracking-widest text-teal-deep font-semibold">
                    Emmanuel
                  </p>
                </div>

                <div className="mb-6">
                  <div className="wedding-pill-badge">
                    <span>◈ 21ST NOVEMBER ◈</span>
                  </div>
                </div>

                <div className="space-y-4 max-w-xs mx-auto text-xs sm:text-sm font-serif">
                  <div className="font-semibold text-teal-deep flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-teal-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path d="M12 7v5l3 3" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>Time: 1pm Prompt</span>
                  </div>

                  <div className="pt-3 border-t border-champagne/30 text-teal-muted">
                    <span className="font-bold text-teal-deep block uppercase tracking-wider text-xs mb-1">
                      Venue:
                    </span>
                    <p className="font-semibold text-teal-deep">Suites Serenity Hotel And Events</p>
                    <p className="text-xs">7 Kwaru Way, Custom Bus Stop, Abaranje Road, Ikotun, Lagos.</p>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="mt-8 pt-4 border-t border-champagne/30">
                  <p className="font-serif italic text-xs text-teal-muted mb-2">Color Code:</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal-deep border border-champagne inline-block"></span>
                      <span className="text-xs text-teal-deep font-medium">Teal</span>
                    </div>
                    <span className="text-champagne/60">&bull;</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-ivory border border-champagne inline-block"></span>
                      <span className="text-xs text-teal-deep font-medium">Ivory</span>
                    </div>
                    <span className="text-champagne/60">&bull;</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-champagne border border-champagne-dark inline-block"></span>
                      <span className="text-xs text-teal-deep font-medium">Champagne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details and Guest Information */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-8 rounded-3xl bg-teal-deep border border-champagne/30 shadow-card space-y-4">
                <div className="flex items-center gap-3 text-champagne">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="font-display text-xl text-ivory font-semibold">Location &amp; Directions</h3>
                </div>
                <p className="font-serif text-base text-ivory/80">
                  <strong className="text-champagne-light">Suites Serenity Hotel And Events</strong>
                  <br />
                  7 Kwaru Way, Custom Bus Stop, Abaranje Road, Ikotun, Lagos, Nigeria.
                </p>
                <div className="pt-2">
                  <a
                    href="https://maps.app.goo.gl/5Pb3mS13VuEAa7QM7?g_st=iwb"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-champagne hover:text-champagne-light underline underline-offset-4"
                  >
                    Open in Google Maps &rarr;
                  </a>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-teal-deep border border-champagne/30 shadow-card space-y-4">
                <div className="flex items-center gap-3 text-champagne">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <h3 className="font-display text-xl text-ivory font-semibold">Aso Ebi &amp; Dress Code</h3>
                </div>
                <p className="font-serif text-base text-ivory/80 leading-relaxed">
                  Our wedding colors are <strong className="text-champagne-light">Teal, Ivory &amp; Champagne</strong>. We kindly encourage our guests to dress in our celebratory colors as we honor this sacred traditional union.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-deep border-2 border-champagne"></span>
                    <span className="text-xs font-sans text-ivory/70">Rich Teal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-ivory border-2 border-champagne"></span>
                    <span className="text-xs font-sans text-ivory/70">Warm Ivory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-champagne border-2 border-champagne-light"></span>
                    <span className="text-xs font-sans text-ivory/70">Champagne Gold</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= PHOTO GALLERY SECTION ======================= */}
      <section id="gallery" className="py-24 bg-teal-deep/40 border-t border-champagne/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="font-serif italic text-champagne text-base sm:text-lg block">
              Cherished Moments
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory font-normal tracking-wide">
              Moments of Us
            </h2>
            <div className="wedding-divider">
              <div className="wedding-divider-diamond"></div>
            </div>
            <p className="font-serif italic text-sm text-ivory/70">
              Click any picture to expand in high resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                src: WeddingIMG1,
                title: 'Safe in Your Arms',
                desc: 'A quiet moment of serenity and deep devotion.',
              },
              {
                src: WeddingIMG2,
                title: 'Endless Laughter',
                desc: 'Finding pure joy in each other’s presence.',
              },
              {
                src: WeddingIMG3,
                title: 'Grace &amp; Royalty',
                desc: 'Dressed in timeless ivory as we prepare for forever.',
              },
              {
                src: PictureWedding,
                title: 'Hand in Hand',
                desc: 'Walking forward together with love as our guide.',
              },
            ].map((photo, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => setSelectedPhoto(photo.src)}
                className="group relative rounded-2xl overflow-hidden border border-champagne/30 bg-teal-forest shadow-card cursor-pointer transition-colors duration-300 hover:border-champagne"
              >
                <div className="aspect-3/4 overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                </div>
                <div className="p-4 bg-teal-deep/90 border-t border-champagne/20">
                  <h4
                    className="font-serif font-bold text-ivory text-base group-hover:text-champagne transition-colors"
                    dangerouslySetInnerHTML={{ __html: photo.title }}
                  />
                  <p className="font-serif italic text-xs text-ivory/70 mt-1">
                    {photo.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Invitation Card Spotlight */}
          <div className="mt-16 p-8 rounded-3xl bg-teal-forest border border-champagne/30 text-center max-w-xl mx-auto space-y-4">
            <span className="font-sans text-xs uppercase tracking-widest text-champagne block">
              Official Invitation
            </span>
            <h3 className="font-display text-xl text-ivory">View Original Invitation Card</h3>
            <p className="font-serif text-sm text-ivory/75">
              The official traditional invitation card designed for the Fasedemi &amp; Kareem families.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedPhoto(cardImage)}
              className="btn-gold text-xs cursor-pointer"
            >
              View Official Invitation
            </motion.button>
          </div>
        </div>
      </section>

      {/* ======================= RSVP SECTION ======================= */}
      <section id="rsvp" className="py-24 bg-wedding-teal relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative">
          <div className="text-center space-y-3 mb-12">
            <span className="font-serif italic text-champagne text-base sm:text-lg block">
              Will You Celebrate With Us?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ivory font-normal tracking-wide">
              RSVP &amp; Well Wishes
            </h2>
            <div className="wedding-divider">
              <div className="wedding-divider-diamond"></div>
            </div>
            <p className="font-serif text-base text-ivory/80 max-w-lg mx-auto">
              Please let us know if you will be attending our traditional wedding ceremony so we can prepare your seat.
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl bg-ivory text-teal-deep shadow-2xl border-2 border-champagne">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-deep text-champagne mx-auto flex items-center justify-center border-2 border-champagne">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-teal-deep">
                  Thank You, {guestName}!
                </h3>
                <p className="font-serif text-base text-teal-muted max-w-md mx-auto">
                  {attending === 'yes'
                    ? 'Your RSVP has been joyfully received! We cannot wait to celebrate with you on November 21st in Lagos.'
                    : 'Thank you for letting us know and sending your sweet thoughts. You will be dearly missed!'}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setGuestName('')
                      setMessage('')
                      setSubmitError(null)
                    }}
                    className="btn-teal text-xs"
                  >
                    Submit Another RSVP
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRSVP} className="space-y-6">
                <div>
                  <label className="block font-serif font-bold text-sm text-teal-deep mb-2">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Samuel Adeleke"
                    className="w-full px-4 py-3 rounded-xl border border-champagne/60 bg-white text-teal-deep focus:outline-none focus:ring-2 focus:ring-champagne font-sans text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-serif font-bold text-sm text-teal-deep mb-2">
                      Will You Be Attending? *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAttending('yes')}
                        className={`py-3 px-3 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold border transition-all ${
                          attending === 'yes'
                            ? 'bg-teal-deep text-ivory border-teal-deep shadow-sm'
                            : 'bg-white text-teal-muted border-champagne/60 hover:bg-champagne/10'
                        }`}
                      >
                        Joyfully Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttending('no')}
                        className={`py-3 px-3 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold border transition-all ${
                          attending === 'no'
                            ? 'bg-teal-deep text-ivory border-teal-deep shadow-sm'
                            : 'bg-white text-teal-muted border-champagne/60 hover:bg-champagne/10'
                        }`}
                      >
                        Regretfully Decline
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-serif font-bold text-sm text-teal-deep mb-2">
                      Number of Guests
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-champagne/60 bg-white text-teal-deep focus:outline-none focus:ring-2 focus:ring-champagne font-sans text-sm"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Persons (+1)</option>
                      <option value="3">3 Persons</option>
                      <option value="4">4 Persons (Family)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-serif font-bold text-sm text-teal-deep mb-2">
                    Prayer or Note for Tobi &amp; Tope
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your prayers, best wishes, and excitement for the happy couple..."
                    className="w-full px-4 py-3 rounded-xl border border-champagne/60 bg-white text-teal-deep focus:outline-none focus:ring-2 focus:ring-champagne font-sans text-sm"
                  ></textarea>
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-700 text-xs font-sans text-center">
                    {submitError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full text-center flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-teal-deep"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Sending RSVP...</span>
                      </>
                    ) : (
                      'Submit RSVP'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Cash Gifts Callout Banner on Home Page */}
          <div className="mt-16 p-8 rounded-3xl bg-teal-deep/80 border border-champagne/40 shadow-card text-center max-w-xl mx-auto space-y-4">
            <div className="wedding-pill-badge text-[11px] py-1 px-3">
              <span>◈ Wedding Registry ◈</span>
            </div>
            <h3 className="font-display text-2xl text-ivory">
              Sending a Cash Gift?
            </h3>
            <p className="font-serif italic text-base text-ivory/80 max-w-md mx-auto">
              "Thank you for coming to our wedding. We appreciate you."
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigateTo('gifts')}
                className="btn-gold text-xs cursor-pointer"
              >
                View Account Details for Cash Gifts &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mobile Toast Bar when Copied */}
      <AnimatePresence>
        {copiedType && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 left-4 right-4 z-50 max-w-sm mx-auto p-4 rounded-2xl bg-teal-deep text-ivory border-2 border-champagne shadow-2xl flex items-center gap-3 backdrop-blur-lg"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-xs">
              <p className="font-bold text-champagne">
                {copiedType === 'account' ? 'Account Number Copied!' : 'Full Details Copied!'}
              </p>
              <p className="text-ivory/80 text-[11px] mt-0.5">
                0774559702 (Access Bank) &bull; Ready to paste into your banking app.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= LIGHTBOX MODAL ======================= */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-champagne shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-teal-deep/80 text-champagne border border-champagne flex items-center justify-center hover:bg-champagne hover:text-teal-deep transition-all cursor-pointer"
              >
                &times;
              </button>
              <img
                src={selectedPhoto}
                alt="Enlarged couple moment"
                className="w-full h-auto max-h-[85vh] object-contain bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
