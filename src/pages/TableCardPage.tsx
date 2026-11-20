import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import bsaLogo from '../assets/BSATransparentLogo.png'

const SAMPLE_GUESTS = [
  // Bride and groom's friends
  { name: 'Bride and Groom friends', table: 'Table 01', role: 'Friends of the Couple' },
  { name: 'Bride and Groom friends', table: 'Table 02', role: 'Friends of the Couple' },
  { name: 'Bride and Groom colleagues ', table: 'Table 03', role: "Friends of the Couple" },
  { name: 'Bride and Groom colleagues ', table: 'Table 04', role: "Friends of the Couple" },
  { name: 'Aso ebi ladies ', table: 'Table 05', role: "Friends of the Couple" },
  { name: 'Groom’s men', table: 'Table 06', role: 'Friends of the Couple' },

  // Bride's family
  { name: 'Carrena\'s Family', table: 'Table 07', role: 'Family of the Bride' },
  { name: 'Carrena\'s Family', table: 'Table 08', role: 'Family of the Bride' },
  { name: 'Brides Siblings friends', table: 'Table 09', role: 'Bride\'s Friends' },

  { name: 'Oladunni\'s Second generation', table: 'Table 10', role: 'Family of the Bride' },

  // Grooms family
  { name: 'Grooms Father\'s friend', table: 'Table 11', role: 'Grooms Family' },
  { name: 'Grooms Mother\'s friend', table: 'Table 12', role: 'Grooms Family' },
  { name: 'Special Guest', table: 'Table 13', role: 'Grooms Family' },
  { name: 'Special Guest', table: 'Table 14', role: 'Grooms Family' },
  { name: 'Special Guest', table: 'Table 15', role: 'Grooms Family' },

  // Bride's Father
  { name: 'Mr Tee\'s Guests', table: 'Table 16', role: 'Family of the Bride' },

  // Bride's mother
  { name: 'Jimoh\'s Family', table: 'Table 17', role: 'Family of the Bride' },
  { name: 'Salvation Army', table: 'Table 18', role: 'Family of the Bride' },
  { name: 'GG Girls', table: 'Table 19', role: 'Family of the Bride' },

  { name: 'Grooms siblings family', table: 'Table 20', role: 'Grooms Family' },
  
  { name: 'Special Guest', table: 'Table 21', role: 'Family of the Bride' },
  { name: 'Special Guest', table: 'Table 22', role: 'Family of the Bride' },
  { name: 'Special Guest', table: 'Table 21', role: 'Family of the Bride' },
  { name: 'Special Guest', table: 'Table 22', role: 'Family of the Bride' },
]

export default function TableCardPage() {
  // Dynamic form state
  const [guestName, setGuestName] = useState(' Mr & Mrs. T. Fasedemi')
  const [tableNumber, setTableNumber] = useState('Table 01')
  const [guestRole, setGuestRole] = useState('Distinguished VIP Guest')
  const [welcomeNote, setWelcomeNote] = useState(
    'We are deeply honored by your presence. Thank you for blessing our union with your love & prayers.'
  )
  const [theme, setTheme] = useState<'ivory' | 'teal'>('teal')
  const [invertTopPanel, setInvertTopPanel] = useState(true)
  const [previewMode, setPreviewMode] = useState<'flat' | 'tent3d'>('flat')

  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Bulk names modal
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkText, setBulkText] = useState('')

  // QR Code base64 Data URLs
  const [qrGifts, setQrGifts] = useState<string>('')
  const [qrWebsite, setQrWebsite] = useState<string>('')
  const [logoDataUrl, setLogoDataUrl] = useState<string>('')

  // Ref to the printable A5 card element
  const cardRef = useRef<HTMLDivElement>(null)

  // Target URLs
  const giftsUrl = 'https://t-w-t.gabbyintelligence.com/gifts'
  const websiteUrl = 'https://t-w-t.gabbyintelligence.com/'

  // Pre-convert BSA logo to base64 Data URL to guarantee clean, non-tainted canvas exports
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const ctx = c.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          setLogoDataUrl(c.toDataURL('image/png'))
        }
      } catch {
        setLogoDataUrl(bsaLogo)
      }
    }
    img.onerror = () => setLogoDataUrl(bsaLogo)
    img.src = bsaLogo
  }, [])

  // Generate QR codes on mount or when theme changes
  useEffect(() => {
    const generateQRCodes = async () => {
      try {
        const darkColor = theme === 'teal' ? '#03241F' : '#063A33'
        const q1 = await QRCode.toDataURL(giftsUrl, {
          width: 380,
          margin: 1,
          color: {
            dark: darkColor,
            light: '#FFFFFF',
          },
        })
        const q2 = await QRCode.toDataURL(websiteUrl, {
          width: 380,
          margin: 1,
          color: {
            dark: darkColor,
            light: '#FFFFFF',
          },
        })
        setQrGifts(q1)
        setQrWebsite(q2)
      } catch (err) {
        console.error('Failed to generate QR codes:', err)
      }
    }
    generateQRCodes()
  }, [theme])

  // Download high-resolution PNG (300 DPI scale)
  const handleDownloadImage = async () => {
    const targetEl = cardRef.current || document.getElementById('printable-table-card')
    if (!targetEl) return
    setIsExporting('png')
    setStatusMessage('Rendering high-res 300 DPI card image...')

    try {
      const canvas = await html2canvas(targetEl as HTMLElement, {
        scale: 2.5, // Crisp 300 DPI print quality
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: theme === 'ivory' ? '#FAF6EE' : '#03241F',
      })

      const dataUrl = canvas.toDataURL('image/png')
      const sanitizedName = guestName.trim().replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Guest'

      const link = document.createElement('a')
      link.download = `${sanitizedName}.png`
      link.href = dataUrl
      link.click()

      setStatusMessage('PNG downloaded successfully! ✓')
      setTimeout(() => setStatusMessage(null), 3500)
    } catch (err) {
      console.error('Failed to generate PNG image:', err)
      const errDetail = err instanceof Error ? err.message : String(err)
      setStatusMessage(`Error exporting image (${errDetail}). Please try again.`)
    } finally {
      setIsExporting(null)
    }
  }

  // Download print-ready A5 PDF
  const handleDownloadPDF = async () => {
    const targetEl = cardRef.current || document.getElementById('printable-table-card')
    if (!targetEl) return
    setIsExporting('pdf')
    setStatusMessage('Generating print-ready A5 PDF...')

    try {
      // Safe capture scale for high-DPI A5 print without exceeding browser canvas memory limits
      const canvas = await html2canvas(targetEl as HTMLElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: theme === 'ivory' ? '#FAF6EE' : '#03241F',
      })

      // A5 portrait dimensions: 148mm width x 210mm height
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      })

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, 148, 210, undefined, 'FAST')

      const sanitizedName = guestName.trim().replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Guest'

      pdf.save(`${sanitizedName}.pdf`)

      setStatusMessage('A5 PDF downloaded successfully! ✓')
      setTimeout(() => setStatusMessage(null), 3500)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      const errDetail = err instanceof Error ? err.message : String(err)
      setStatusMessage(`Error exporting PDF (${errDetail}). Please try again.`)
    } finally {
      setIsExporting(null)
    }
  }

  // Native Print with Guest Name as suggested PDF filename / print title
  const handlePrint = () => {
    const originalTitle = document.title
    const sanitizedName = guestName.trim().replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Guest'
    document.title = sanitizedName

    window.print()

    const handleAfterPrint = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('afterprint', handleAfterPrint)

    setTimeout(() => {
      document.title = originalTitle
    }, 2000)
  }

  // Apply a sample guest preset
  const handleApplyPreset = (preset: (typeof SAMPLE_GUESTS)[0]) => {
    setGuestName(preset.name)
    setTableNumber(preset.table)
    setGuestRole(preset.role)
  }

  // Bulk names processing
  const handleProcessBulk = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
    if (lines.length > 0) {
      setGuestName(lines[0])
      setShowBulkModal(false)
      setStatusMessage(`Loaded first of ${lines.length} guests. Use the list to switch!`)
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }


  return (
    <div className="pt-24 sm:pt-28 pb-20 min-h-screen bg-teal-forest text-ivory">
      {/* Top Banner Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/20 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-champagne mb-1">
              <Link to="/" className="hover:underline">
                &larr; Back to Wedding Invitation
              </Link>
              <span>&bull;</span>
              <span>Stationery Studio</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-ivory font-bold">
              Guest Table Card Generator (Foldable A5)
            </h1>
            <p className="font-serif italic text-sm text-ivory/70 mt-1">
              Create, customize, and export print-ready A5 folded tent cards with guest names and dual QR codes.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-champagne/40 bg-teal-deep/80 hover:bg-champagne hover:text-teal-deep text-champagne text-xs font-sans font-semibold tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print (A5)</span>
            </button>
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleDownloadImage}
              className="px-4 py-2.5 rounded-xl border border-champagne bg-champagne/15 hover:bg-champagne hover:text-teal-deep text-champagne text-xs font-sans font-semibold tracking-wider transition-all shadow-gold-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting === 'png' ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Exporting PNG...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Image (PNG)</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleDownloadPDF}
              className="btn-gold text-xs py-2.5 px-5 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting === 'pdf' ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Building PDF...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF (A5)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl bg-champagne/20 border border-champagne text-champagne text-xs font-sans font-medium text-center shadow-lg"
            >
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Studio Grid: Controls on left, Live Card on right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ===================== CONTROL PANEL (LEFT) ===================== */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {/* Card Details Form */}
          <div className="p-6 rounded-3xl bg-teal-deep/80 border border-champagne/30 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-champagne/20 pb-3">
              <h2 className="font-display text-lg text-champagne font-semibold">
                Guest &amp; Table Details
              </h2>
              <span className="text-[10px] font-sans tracking-widest uppercase text-ivory/60">
                Live Preview
              </span>
            </div>

            {/* Guest Full Name Input */}
            <div>
              <label className="block font-serif text-xs font-bold text-champagne mb-1.5">
                Guest Full Name / Title *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Mr &amp; Mrs. T. Fasedemi"
                className="w-full px-4 py-2.5 rounded-xl border border-champagne/50 bg-teal-forest/80 text-ivory placeholder:text-ivory/40 text-sm focus:outline-none focus:ring-2 focus:ring-champagne font-sans"
              />
            </div>

            {/* Table Number & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-serif text-xs font-bold text-champagne mb-1.5">
                  Table Number / Name *
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. Table 07, High Table"
                  className="w-full px-4 py-2.5 rounded-xl border border-champagne/50 bg-teal-forest/80 text-ivory placeholder:text-ivory/40 text-sm focus:outline-none focus:ring-2 focus:ring-champagne font-sans"
                />
              </div>

              <div>
                <label className="block font-serif text-xs font-bold text-champagne mb-1.5">
                  Guest Role / Category
                </label>
                <input
                  type="text"
                  value={guestRole}
                  onChange={(e) => setGuestRole(e.target.value)}
                  placeholder="e.g. VIP Honored Guest"
                  className="w-full px-4 py-2.5 rounded-xl border border-champagne/50 bg-teal-forest/80 text-ivory placeholder:text-ivory/40 text-sm focus:outline-none focus:ring-2 focus:ring-champagne font-sans"
                />
              </div>
            </div>

            {/* Welcome Note */}
            <div>
              <label className="block font-serif text-xs font-bold text-champagne mb-1.5">
                Personalized Welcome Prayer / Note
              </label>
              <textarea
                rows={2}
                value={welcomeNote}
                onChange={(e) => setWelcomeNote(e.target.value)}
                placeholder="Short greeting for the guest on their table..."
                className="w-full px-4 py-2.5 rounded-xl border border-champagne/50 bg-teal-forest/80 text-ivory placeholder:text-ivory/40 text-xs focus:outline-none focus:ring-2 focus:ring-champagne font-sans"
              ></textarea>
            </div>

            {/* Quick Sample Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-sans uppercase tracking-widest text-ivory/70 font-semibold">
                  Sample Guest Presets
                </span>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(true)}
                  className="text-[11px] text-champagne hover:underline cursor-pointer"
                >
                  Bulk Paste Names &rarr;
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_GUESTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-champagne/30 bg-teal-forest/60 hover:bg-champagne hover:text-teal-deep text-ivory/80 transition-colors cursor-pointer"
                  >
                    {preset.name.split(' ')[0]} {preset.table}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card Formatting & Printing Settings */}
          <div className="p-6 rounded-3xl bg-teal-deep/80 border border-champagne/30 shadow-card space-y-5">
            <h2 className="font-display text-lg text-champagne font-semibold border-b border-champagne/20 pb-3">
              Print &amp; Theme Settings
            </h2>

            {/* Theme Selector */}
            <div>
              <label className="block font-serif text-xs font-bold text-champagne mb-2">
                Cardstock Paper Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('ivory')}
                  className={`py-3 px-3 rounded-xl border text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${theme === 'ivory'
                      ? 'bg-ivory text-teal-deep border-champagne shadow-md'
                      : 'bg-teal-forest/60 text-ivory/70 border-champagne/30 hover:border-champagne'
                    }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-ivory border border-champagne"></span>
                  <span>Royal Ivory (Recommended)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('teal')}
                  className={`py-3 px-3 rounded-xl border text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${theme === 'teal'
                      ? 'bg-teal-forest text-champagne border-champagne shadow-md'
                      : 'bg-teal-forest/60 text-ivory/70 border-champagne/30 hover:border-champagne'
                    }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-deep border border-champagne"></span>
                  <span>Deep Forest Teal</span>
                </button>
              </div>
              <p className="text-[11px] text-ivory/50 mt-1.5 font-serif italic">
                * "Royal Ivory" uses minimal printer ink and looks ultra-luxurious on heavy textured cardstock paper.
              </p>
            </div>

            {/* Tent Inversion Toggle */}
            <div className="pt-2 border-t border-champagne/20 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invertTopPanel}
                  onChange={(e) => setInvertTopPanel(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-champagne accent-[#D4AF67] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-sans font-semibold text-ivory block">
                    Invert Top Panel for Standing Tent Fold (180°)
                  </span>
                  <span className="text-[11px] font-serif italic text-ivory/60 block mt-0.5">
                    When folded across the middle, both front and back faces will stand right-side up to people looking from either side of the table.
                  </span>
                </div>
              </label>


            </div>

            {/* Preview Mode Selector */}
            <div className="pt-2 border-t border-champagne/20">
              <label className="block font-serif text-xs font-bold text-champagne mb-2">
                Display Preview
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode('flat')}
                  className={`py-2 px-3 rounded-xl border text-xs font-sans font-semibold transition-all cursor-pointer ${previewMode === 'flat'
                      ? 'bg-champagne text-teal-deep border-champagne font-bold'
                      : 'bg-teal-forest/60 text-ivory/70 border-champagne/30'
                    }`}
                >
                  Flat A5 Sheet (Print View)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('tent3d')}
                  className={`py-2 px-3 rounded-xl border text-xs font-sans font-semibold transition-all cursor-pointer ${previewMode === 'tent3d'
                      ? 'bg-champagne text-teal-deep border-champagne font-bold'
                      : 'bg-teal-forest/60 text-ivory/70 border-champagne/30'
                    }`}
                >
                  3D Tent Fold (Table View)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CARD PREVIEW (RIGHT) ===================== */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Card Dimensions & Help Indicator */}
          <div className="w-full max-w-120 sm:max-w-135 flex items-center justify-between text-xs font-sans text-champagne/80 mb-3 px-2 no-print">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Foldable A5 (148mm × 210mm)</span>
            </span>
            <span>Fold size: 148mm × 105mm (A6 tent face)</span>
          </div>

          {/* ==================== 3D TENT SIMULATION PREVIEW ==================== */}
          {previewMode === 'tent3d' && (
            <div className="w-full max-w-120 sm:max-w-135 py-10 flex flex-col items-center justify-center no-print">
              <div className="relative perspective-[1000px] w-full max-w-95 aspect-148/105 my-6">
                {/* 3D Tent Card Front Face */}
                <div className="relative w-full h-full rounded-2xl p-6 shadow-2xl border-2 border-champagne bg-ivory text-teal-deep transform -rotate-x-12 origin-bottom transition-transform duration-500 flex flex-col justify-between items-center text-center">
                  <div className="flex items-center gap-2">
                    <img src="/favicon.svg" alt="Monogram" className="w-6 h-6 rounded-full" />
                    <span className="font-display text-[9px] tracking-widest uppercase text-champagne-dark font-bold">
                      Oluwatobi &amp; Temitope
                    </span>
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-deep text-ivory text-[10px] font-sans uppercase font-bold tracking-widest inline-block mb-1">
                      {tableNumber}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-teal-deep leading-tight">
                      {guestName}
                    </h3>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-champagne-dark font-semibold mt-0.5">
                      {guestRole}
                    </p>
                  </div>
                  <p className="font-serif italic text-[10px] text-teal-muted max-w-70">
                    "Thank you for sharing in our celebratory joy!"
                  </p>
                </div>

                {/* Simulated shadow on wooden table */}
                <div className="w-[90%] mx-auto h-5 bg-black/40 blur-md rounded-full mt-2"></div>
              </div>

              <div className="text-center space-y-1">
                <p className="font-serif italic text-sm text-champagne">
                  3D Standing Table Tent View
                </p>
                <p className="text-xs font-sans text-ivory/60">
                  Switch back to "Flat A5 Sheet" to view the full 2-sided sheet!
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewMode('flat')}
                  className="mt-2 text-xs font-sans text-champagne underline underline-offset-2 hover:text-champagne-light cursor-pointer"
                >
                  &larr; Switch to Flat Sheet View
                </button>
              </div>
            </div>
          )}

          {/* ==================== FLAT PRINT-READY A5 SHEET ==================== */}
          {/* Always mounted; hidden off-screen when in 3D mode so cardRef is always valid */}
          <div
            className={
              previewMode === 'tent3d'
                ? 'absolute left-[-9999px] top-0 pointer-events-none'
                : 'w-full flex justify-center overflow-x-auto p-2'
            }
          >
            <div
              ref={cardRef}
              id="printable-table-card"
              style={{
                position: 'relative',
                width: '148mm',
                height: '210mm',
                maxWidth: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                backgroundColor: theme === 'ivory' ? '#FAF6EE' : '#03241F',
                color: theme === 'ivory' ? '#063A33' : '#FAF6EE',
                fontFamily: 'sans-serif',
              }}
            >
              {/* Outer Gold Border */}
              <div
                style={{
                  position: 'absolute',
                  inset: '8px',
                  borderRadius: '16px',
                  border: '2px solid #D4AF67',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                {/* Inner Accent Border */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '4px',
                    borderRadius: '12px',
                    border: '1px solid rgba(212,175,103,0.4)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* ===================================================================
               * PANEL 1 (TOP HALF - BACK DISPLAY / STANDING FACING OUTWARD)
               * =================================================================== */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '105mm',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  transform: invertTopPanel ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s',
                }}
              >
                {/* Top Crest & Header */}
                <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ height: '1px', width: '24px', backgroundColor: '#D4AF67', display: 'block' }} />
                    <span style={{ fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: '#D4AF67' }}>
                      Celebrate · Bless · Connect
                    </span>
                    <span style={{ height: '1px', width: '24px', backgroundColor: '#D4AF67', display: 'block' }} />
                  </div>
                  <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', lineHeight: 1, margin: 0, color: theme === 'ivory' ? '#063A33' : '#FAF6EE' }}>
                    Oluwatobi &amp; Temitope
                  </h4>
                </div>

                {/* Dual QR Codes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: 'auto 0', padding: '0 4px' }}>
                  {/* QR 1 – Cash Gift */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(212,175,103,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme === 'ivory' ? '#FFFFFFE6' : '#063A33CC',
                  }}>
                    <span style={{ fontSize: '9px', fontFamily: 'sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF67', marginBottom: '4px' }}>
                      ◈ Send Cash Gift
                    </span>
                    <div style={{ width: '80px', height: '80px', padding: '4px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid rgba(212,175,103,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {qrGifts && <img src={qrGifts} alt="QR Cash Gift" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '8px', fontFamily: 'sans-serif', lineHeight: 1.4 }}>
                      <p style={{ fontWeight: 700, color: '#063A33', margin: 0 }}>Access Bank · 0774559702</p>
                      <p style={{ color: '#6B7280', fontSize: '7.5px', margin: 0 }}>Oluwatobi Fasedemi</p>
                    </div>
                  </div>

                  {/* QR 2 – Wedding Website */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(212,175,103,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme === 'ivory' ? '#FFFFFFE6' : '#063A33CC',
                  }}>
                    <span style={{ fontSize: '9px', fontFamily: 'sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF67', marginBottom: '4px' }}>
                      ◈ Wedding Website
                    </span>
                    <div style={{ width: '80px', height: '80px', padding: '4px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid rgba(212,175,103,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {qrWebsite && <img src={qrWebsite} alt="QR Website" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '8px', fontFamily: 'sans-serif', lineHeight: 1.4 }}>
                      <p style={{ fontWeight: 700, color: '#063A33', margin: 0 }}>Our Story &amp; Gallery</p>
                      <p style={{ color: '#6B7280', fontSize: '7.5px', margin: 0 }}>t-w-t.gabbyintelligence.com</p>
                    </div>
                  </div>
                </div>

                {/* GabbyIntelligence Branding */}
                <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(212,175,103,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '4px', paddingRight: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {(logoDataUrl || bsaLogo) && (
                      <img src={logoDataUrl || bsaLogo} alt="GabbyIntelligence" style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }} />
                    )}
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: '7.5px', letterSpacing: '0.05em', color: '#063A33', display: 'block', lineHeight: 1.2 }}>GabbyIntelligence</span>
                      <span style={{ fontFamily: 'sans-serif', fontSize: '6.5px', color: '#D4AF67', display: 'block', lineHeight: 1.2 }}>socialbusinessassistant.gabbyintelligence.com</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '7.5px', color: '#9CA3AF' }}>Digital Guest Experience</span>
                </div>
              </div>

              {/* ===================================================================
               * CENTER FOLD LINE
               * =================================================================== */}
              <div style={{ position: 'relative', width: '100%', height: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '2px dashed rgba(212,175,103,0.5)', zIndex: 20 }}>
                <div style={{
                  padding: '2px 12px',
                  borderRadius: '9999px',
                  fontSize: '7.5px',
                  fontFamily: 'sans-serif',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  border: '1px solid rgba(212,175,103,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: theme === 'ivory' ? '#FAF6EE' : '#03241F',
                  color: '#D4AF67',
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                }}>
                  <span>✂</span>
                  <span>FOLD ALONG THIS LINE (PLIER ICI)</span>
                  <span>✂</span>
                </div>
              </div>

              {/* ===================================================================
               * PANEL 2 (BOTTOM HALF - FRONT FACE / FACING SITTING GUEST)
               * =================================================================== */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '105mm',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}>
                {/* Monogram Seal */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingTop: '4px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #F7E7C4 0%, #D4AF67 50%, #B3883B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#063A33', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF67', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em' }}>
                      O◈T
                    </div>
                  </div>
                  <span style={{ fontFamily: 'sans-serif', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF67', fontWeight: 700 }}>
                    Traditional Wedding Celebration
                  </span>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', lineHeight: 1, margin: 0, color: theme === 'ivory' ? '#063A33' : '#FAF6EE' }}>
                    Oluwatobi &amp; Temitope
                  </h3>
                </div>

                {/* Guest Name Centerpiece */}
                <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: '90%' }}>
                  {/* Table Pill */}
                  <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', backgroundColor: '#063A33', color: '#FAF6EE', border: '1px solid #D4AF67' }}>
                    <span style={{ fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: '#D4AF67' }}>
                      ◈ {tableNumber.toUpperCase()} ◈
                    </span>
                  </div>
                  {/* Guest Name */}
                  <div style={{ padding: '4px 0' }}>
                    <h2 style={{
                      fontFamily: 'Georgia, serif',
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                      margin: 0,
                      fontSize: guestName.length > 25 ? '14px' : guestName.length > 18 ? '17px' : '21px',
                      color: theme === 'ivory' ? '#063A33' : '#FAF6EE',
                    }}>
                      {guestName || 'Valued Guest'}
                    </h2>
                    {guestRole && (
                      <p style={{ fontFamily: 'sans-serif', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF67', fontWeight: 600, margin: '2px 0 0' }}>
                        {guestRole}
                      </p>
                    )}
                  </div>
                  {/* Welcome Note */}
                  {welcomeNote && (
                    <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '8.5px', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5, color: theme === 'ivory' ? '#385A53' : '#FAF6EEBF' }}>
                      "{welcomeNote}"
                    </p>
                  )}
                </div>

                {/* Date & Location Footer */}
                <div style={{ width: '100%', paddingTop: '6px', borderTop: '1px solid rgba(212,175,103,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '7.5px', fontFamily: 'Georgia, serif', color: '#D4AF67' }}>
                  <span>Saturday, 21st November 2026</span>
                  <span>·</span>
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BULK NAMES MODAL ===================== */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-teal-deep border-2 border-champagne shadow-2xl text-ivory space-y-4"
            >
              <div className="flex items-center justify-between border-b border-champagne/20 pb-3">
                <h3 className="font-display text-lg text-champagne font-bold">
                  Bulk Guest Name List
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="w-8 h-8 rounded-full bg-teal-forest border border-champagne/40 flex items-center justify-center hover:bg-champagne hover:text-teal-deep transition-colors text-sm cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <p className="font-serif italic text-xs text-ivory/80">
                Paste your guest names (one per line). You can then quickly preview and export cards one by one!
              </p>

              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Mr &amp; Mrs. T. Fasedemi&#10;Dr. & Dr. (Mrs.) Femi Fasedemi&#10;Hon. Samuel Adeleke&#10;Pastor & Mrs. Johnson"
                className="w-full px-4 py-3 rounded-xl border border-champagne/50 bg-teal-forest text-ivory text-xs font-sans focus:outline-none focus:ring-2 focus:ring-champagne"
              ></textarea>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl border border-champagne/40 text-xs font-sans hover:bg-champagne/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessBulk}
                  className="btn-gold text-xs py-2 px-5 cursor-pointer"
                >
                  Load Guest List
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
