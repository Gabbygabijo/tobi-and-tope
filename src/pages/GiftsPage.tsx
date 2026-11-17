import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { WeddingIMG1 } from '../assets/images'

export default function GiftsPage() {
  const navigate = useNavigate()
  const [copiedType, setCopiedType] = useState<'account' | 'full' | null>(null)

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

  const handleGoToRSVP = () => {
    navigate('/')
    setTimeout(() => {
      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  return (
    <>
      {/* ======================= DEDICATED MONETARY GIFT PAGE ======================= */}
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
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-champagne hover:text-champagne-light transition-colors cursor-pointer group py-1"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span>
              <span>Return to Homepage</span>
            </Link>
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
            <Link to="/" className="btn-teal w-full sm:w-auto text-center cursor-pointer">
              &larr; Back to Wedding Ceremony
            </Link>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleGoToRSVP}
              className="btn-gold w-full sm:w-auto text-center cursor-pointer"
            >
              Confirm Attendance / RSVP
            </motion.button>
          </div>
        </div>
      </motion.section>

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
    </>
  )
}
