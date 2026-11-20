import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import bsaLogo from '../assets/BSATransparentLogo.png'

const SAMPLE_GUESTS = [
  { name: 'Bride and Groom friends', table: 'Table 01', role: 'Friends of the Couple' },
  { name: 'Bride and Groom colleagues ', table: 'Table 02', role: "Groom's Family" },
  { name: 'Aso ebi ladies ', table: 'Table 03', role: "Bride's Family" },
  { name: 'Groom’s men', table: 'High Table', role: 'Special Guest of Honor' },
  { name: 'Mr. Babatunde & Friends', table: 'Table 05', role: 'Friends of the Couple' },
]

export default function TableCardPage() {
  // Dynamic form state
  const [guestName, setGuestName] = useState('Chief & Mrs. O. Adeleke')
  const [tableNumber, setTableNumber] = useState('Table 01')
  const [guestRole, setGuestRole] = useState('Distinguished VIP Guest')
  const [welcomeNote, setWelcomeNote] = useState(
    'We are deeply honored by your presence. Thank you for blessing our union with your love & prayers.'
  )
  const [theme, setTheme] = useState<'ivory' | 'teal'>('ivory')
  const [invertTopPanel, setInvertTopPanel] = useState(true)
  const [previewMode, setPreviewMode] = useState<'flat' | 'tent3d'>('flat')
  const [showBankDetails, setShowBankDetails] = useState(true)
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
      const sanitizedName = guestName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Guest'
      const sanitizedTable = tableNumber.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Table'

      const link = document.createElement('a')
      link.download = `A5-TableCard-${sanitizedName}-${sanitizedTable}.png`
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

      const sanitizedName = guestName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Guest'
      const sanitizedTable = tableNumber.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Table'

      pdf.save(`A5-TableCard-${sanitizedName}-${sanitizedTable}.pdf`)

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

  // Native Print
  const handlePrint = () => {
    window.print()
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

  // Calculate dynamic text size for guest name based on length
  const getGuestNameFontSizeClass = (name: string) => {
    const len = name.length
    if (len > 35) return 'text-base sm:text-lg leading-tight'
    if (len > 25) return 'text-lg sm:text-xl leading-tight'
    if (len > 18) return 'text-xl sm:text-2xl leading-tight'
    return 'text-2xl sm:text-3xl leading-snug'
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
                placeholder="e.g. Chief &amp; Mrs. O. Adeleke"
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
                  className={`py-3 px-3 rounded-xl border text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    theme === 'ivory'
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
                  className={`py-3 px-3 rounded-xl border text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    theme === 'teal'
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

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBankDetails}
                  onChange={(e) => setShowBankDetails(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-champagne accent-[#D4AF67] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-sans font-semibold text-ivory block">
                    Show Access Bank Details Under Gift QR
                  </span>
                  <span className="text-[11px] font-serif italic text-ivory/60 block mt-0.5">
                    Displays account number (0774559702) in clear print next to the QR code.
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
                  className={`py-2 px-3 rounded-xl border text-xs font-sans font-semibold transition-all cursor-pointer ${
                    previewMode === 'flat'
                      ? 'bg-champagne text-teal-deep border-champagne font-bold'
                      : 'bg-teal-forest/60 text-ivory/70 border-champagne/30'
                  }`}
                >
                  Flat A5 Sheet (Print View)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('tent3d')}
                  className={`py-2 px-3 rounded-xl border text-xs font-sans font-semibold transition-all cursor-pointer ${
                    previewMode === 'tent3d'
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
                className={`relative w-[148mm] h-[210mm] max-w-full shadow-2xl transition-all duration-300 select-none overflow-hidden flex flex-col justify-between ${
                  theme === 'ivory'
                    ? 'bg-[#FAF6EE] text-teal-deep'
                    : 'bg-teal-forest text-[#FAF6EE]'
                }`}
                style={{
                  boxSizing: 'border-box',
                }}
              >
                {/* Outer Delicate Gold Filigree Border */}
                <div
                  className={`absolute inset-2 sm:inset-3 rounded-2xl border-2 pointer-events-none z-10 ${
                    theme === 'ivory' ? 'border-[#D4AF67]' : 'border-[#D4AF67]'
                  }`}
                >
                  {/* Inner Fine Accent Border */}
                  <div
                    className={`absolute inset-1 rounded-xl border pointer-events-none ${
                      theme === 'ivory' ? 'border-[#D4AF67]/40' : 'border-[#D4AF67]/30'
                    }`}
                  ></div>
                </div>

                {/* ===================================================================
                 * PANEL 1 (TOP HALF - BACK DISPLAY / STANDING FACING OUTWARD)
                 * Dimensions: 148mm x 105mm
                 * When invertTopPanel is ON, rotate-180 so it stands right side up!
                 * =================================================================== */}
                <div
                  className={`relative w-full h-[105mm] p-5 sm:p-6 flex flex-col justify-between transition-transform duration-300 ${
                    invertTopPanel ? 'rotate-180' : ''
                  }`}
                >
                  {/* Top Crest & Header */}
                  <div className="text-center pt-1">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="h-px w-6 bg-[#D4AF67]/60"></span>
                      <span className="font-display text-[9px] sm:text-[10px] tracking-widest uppercase font-bold text-[#D4AF67]">
                        Celebrate &bull; Bless &bull; Connect
                      </span>
                      <span className="h-px w-6 bg-[#D4AF67]/60"></span>
                    </div>
                    <h4
                      className={`font-script text-2xl sm:text-3xl leading-none ${
                        theme === 'ivory' ? 'text-teal-deep' : 'text-[#FAF6EE]'
                      }`}
                    >
                      Oluwatobi &amp; Temitope
                    </h4>
                  </div>

                  {/* Dual QR Codes Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto px-1 sm:px-2">
                    {/* QR Code 1: Monetary Gifts & Registry */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center text-center justify-between ${
                        theme === 'ivory'
                          ? 'bg-white/90 border-[#D4AF67]/40 shadow-xs'
                          : 'bg-teal-deep/80 border-[#D4AF67]/40'
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-[#D4AF67] mb-1">
                        ◈ Send Cash Gift
                      </span>

                      {/* QR Box */}
                      <div className="w-20 h-20 sm:w-22 sm:h-22 p-1 bg-white rounded-lg border border-[#D4AF67]/40 shadow-xs flex items-center justify-center">
                        {qrGifts ? (
                          <img src={qrGifts} alt="QR for Cash Gifts" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
                        )}
                      </div>

                      {/* Bank Details */}
                      {showBankDetails ? (
                        <div className="mt-1 text-[8px] sm:text-[9px] font-sans leading-tight">
                          <p className="font-bold text-teal-deep dark:text-[#D4AF67]">
                            Access Bank &bull; 0774559702
                          </p>
                          <p className="text-gray-500 dark:text-gray-300 text-[7.5px]">
                            Oluwatobi Fasedemi
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-[8px] font-serif italic text-gray-500">
                          Scan to view registry
                        </p>
                      )}
                    </div>

                    {/* QR Code 2: Wedding Website */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center text-center justify-between ${
                        theme === 'ivory'
                          ? 'bg-white/90 border-[#D4AF67]/40 shadow-xs'
                          : 'bg-teal-deep/80 border-[#D4AF67]/40'
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-[#D4AF67] mb-1">
                        ◈ Wedding Website
                      </span>

                      {/* QR Box */}
                      <div className="w-20 h-20 sm:w-22 sm:h-22 p-1 bg-white rounded-lg border border-[#D4AF67]/40 shadow-xs flex items-center justify-center">
                        {qrWebsite ? (
                          <img src={qrWebsite} alt="QR for Wedding Website" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
                        )}
                      </div>

                      <div className="mt-1 text-[8px] sm:text-[9px] font-sans leading-tight">
                        <p className="font-bold text-teal-deep dark:text-[#D4AF67]">
                          Our Story &amp; Gallery
                        </p>
                        <p className="text-gray-500 dark:text-gray-300 text-[7.5px]">
                          t-w-t.gabbyintelligence.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* GabbyIntelligence Advert / Awareness Section */}
                  <div className="pt-2 border-t border-[#D4AF67]/20 flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={logoDataUrl || bsaLogo}
                        alt="GabbyIntelligence"
                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded"
                      />
                      <div className="text-left">
                        <span className="font-sans font-bold text-[7.5px] sm:text-[8px] tracking-wide text-teal-deep dark:text-ivory block leading-tight">
                          GabbyIntelligence
                        </span>
                        <span className="font-sans text-[6.5px] sm:text-[7px] text-[#D4AF67] block leading-tight">
                          socialbusinessassistant.gabbyintelligence.com
                        </span>
                      </div>
                    </div>

                    <span className="font-serif italic text-[7.5px] sm:text-[8px] text-gray-400">
                      Digital Guest Experience
                    </span>
                  </div>
                </div>

                {/* ===================================================================
                 * CENTER FOLD GUIDE LINE
                 * Positioned exactly at 105mm (middle of 210mm A5 sheet)
                 * =================================================================== */}
                <div className="relative w-full h-0 flex items-center justify-center border-t-2 border-dashed border-[#D4AF67]/50 z-20">
                  <div
                    className={`px-3 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-sans tracking-widest uppercase font-bold border border-[#D4AF67]/40 shadow-xs flex items-center gap-1.5 ${
                      theme === 'ivory' ? 'bg-[#FAF6EE] text-[#D4AF67]' : 'bg-teal-forest text-[#D4AF67]'
                    }`}
                  >
                    <span>✂</span>
                    <span>FOLD ALONG THIS LINE (PLIER ICI)</span>
                    <span>✂</span>
                  </div>
                </div>

                {/* ===================================================================
                 * PANEL 2 (BOTTOM HALF - FRONT FACE / FACING SITTING GUEST)
                 * Dimensions: 148mm x 105mm
                 * Right-side up: Features Monogram, Table Number, Guest Full Name
                 * =================================================================== */}
                <div className="relative w-full h-[105mm] p-5 sm:p-6 flex flex-col justify-between items-center text-center">
                  {/* Monogram Seal & Header */}
                  <div className="space-y-0.5 pt-1">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full p-0.5 shadow-gold-sm flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #F7E7C4 0%, #D4AF67 50%, #B3883B 100%)' }}
                    >
                      <div className="w-full h-full rounded-full bg-teal-deep flex items-center justify-center text-[#D4AF67] font-display font-bold text-xs tracking-wider">
                        O◈T
                      </div>
                    </div>

                    <span className="font-sans text-[8px] sm:text-[9px] uppercase tracking-widest text-[#D4AF67] font-bold block">
                      Traditional Wedding Celebration
                    </span>
                    <h3
                      className={`font-script text-2xl sm:text-3xl leading-none ${
                        theme === 'ivory' ? 'text-teal-deep' : 'text-[#FAF6EE]'
                      }`}
                    >
                      Oluwatobi &amp; Temitope
                    </h3>
                  </div>

                  {/* Main Guest Designation Centerpiece */}
                  <div className="my-auto space-y-1.5 max-w-[90%]">
                    {/* Table Pill */}
                    <div className="inline-block px-3 py-1 rounded-full bg-teal-deep text-[#FAF6EE] border border-[#D4AF67] shadow-xs">
                      <span className="font-display text-[9px] sm:text-[10px] tracking-widest uppercase font-bold text-[#D4AF67]">
                        ◈ {tableNumber.toUpperCase()} ◈
                      </span>
                    </div>

                    {/* Guest Full Name */}
                    <div className="py-1">
                      <h2
                        className={`font-serif font-extrabold tracking-wide drop-shadow-xs ${getGuestNameFontSizeClass(
                          guestName
                        )} ${theme === 'ivory' ? 'text-teal-dbg-teal-deep' : 'text-[#FAF6EE]'}`}
                      >
                        {guestName || 'Valued Guest'}
                      </h2>

                      {guestRole && (
                        <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-[#D4AF67] font-semibold mt-0.5">
                          {guestRole}
                        </p>
                      )}
                    </div>

                    {/* Welcoming Note */}
                    {welcomeNote && (
                      <p
                        className={`font-serif italic text-[8.5px] sm:text-[9.5px] max-w-75 mx-auto leading-relaxed ${
                          theme === 'ivory' ? 'text-teal-muted' : 'text-ivory/80'
                        }`}
                      >
                        "{welcomeNote}"
                      </p>
                    )}
                  </div>

                  {/* Date & Location Footer */}
                  <div className="w-full pt-1.5 border-t border-[#D4AF67]/20 flex items-center justify-between text-[7.5px] sm:text-[8px] font-serif text-[#D4AF67]">
                    <span>Saturday, 21st November 2026</span>
                    <span>&bull;</span>
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
                placeholder="Chief & Mrs. O. Adeleke&#10;Dr. & Dr. (Mrs.) Femi Fasedemi&#10;Hon. Samuel Adeleke&#10;Pastor & Mrs. Johnson"
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
