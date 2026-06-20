'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Download, RefreshCw, Share2, X } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { useGraduationStore } from '../../store/useGraduationStore'

const UNI_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME || 'Nextora Academy'
const YEAR = process.env.NEXT_PUBLIC_CEREMONY_YEAR || '2026'

const FRAMES = [
  { id: 'classic', label: 'Classic Orange', emoji: '🎓', borderColor: '#E8720C', bgColor: 'rgba(232,114,12,0.15)', cornerEmoji: '🎓' },
  { id: 'confetti', label: 'Confetti', emoji: '🎉', borderColor: '#7c3aed', bgColor: 'rgba(124,58,237,0.15)', cornerEmoji: '🎊' },
  { id: 'floral', label: 'Floral', emoji: '🌸', borderColor: '#ec4899', bgColor: 'rgba(236,72,153,0.15)', cornerEmoji: '🌹' },
  { id: 'stars', label: 'Starlight', emoji: '⭐', borderColor: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)', cornerEmoji: '✨' },
  { id: 'navy', label: 'University', emoji: '🏛️', borderColor: '#3b82f6', bgColor: 'rgba(59,130,246,0.15)', cornerEmoji: '📚' },
]

const STICKERS = ['🎓', '🎉', '🏆', '⭐', '💐', '🥳', '❤️', '🔥', '👑', '🙌', '💫', '🎊']

interface CapturedPhoto {
  id: string
  dataUrl: string
  frame: string
  timestamp: number
}

export default function PhotoBoothPage() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0])
  const [captured, setCaptured] = useState<CapturedPhoto | null>(null)
  const [gallery, setGallery] = useState<CapturedPhoto[]>([])
  const [selectedStickers, setSelectedStickers] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // photo count tracked locally

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
      setStream(s)
    } catch {
      alert('Could not access camera. Please allow camera permissions, or upload a photo instead.')
    }
  }

  // The <video> element only mounts once `stream` is set, so attach the
  // stream here (after it exists in the DOM) instead of right after getUserMedia.
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stream])

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
  }

  const startCountdown = () => {
    let count = 3
    setCountdown(count)
    const id = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(id)
        setCountdown(null)
        capturePhoto()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  const drawFrameOverlay = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const frame = selectedFrame
    ctx.strokeStyle = frame.borderColor
    ctx.lineWidth = 12
    ctx.strokeRect(6, 6, w - 12, h - 12)

    const corners = [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]]
    ctx.font = '32px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    corners.forEach(([x, y]) => ctx.fillText(frame.cornerEmoji, x, y))

    ctx.fillStyle = frame.borderColor
    ctx.font = 'bold 18px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${UNI_NAME} · Graduation ${YEAR}`, w / 2, h - 15)

    if (selectedStickers.length > 0) {
      ctx.font = '36px serif'
      selectedStickers.forEach((s, i) => {
        ctx.fillText(s, 60 + i * 50, h - 60)
      })
    }
  }, [selectedFrame, selectedStickers])

  const finishCapture = useCallback((dataUrl: string) => {
    const photo: CapturedPhoto = { id: Date.now().toString(), dataUrl, frame: selectedFrame.id, timestamp: Date.now() }
    setCaptured(photo)
    setGallery((prev) => [photo, ...prev.slice(0, 11)])
  }, [selectedFrame])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!
    const w = 640
    const h = 480
    canvasRef.current.width = w
    canvasRef.current.height = h

    // Draw video mirrored, matching the on-screen selfie preview
    ctx.save()
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(videoRef.current, 0, 0, w, h)
    ctx.restore()

    drawFrameOverlay(ctx, w, h)

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92)
    finishCapture(dataUrl)
  }, [drawFrameOverlay, finishCapture])

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')!
        const w = 640
        const h = 480
        canvasRef.current.width = w
        canvasRef.current.height = h

        // Cover-fit the uploaded image into the frame without cropping out the subject
        const scale = Math.max(w / img.width, h / img.height)
        const sw = w / scale
        const sh = h / scale
        const sx = (img.width - sw) / 2
        const sy = (img.height - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)

        drawFrameOverlay(ctx, w, h)
        finishCapture(canvasRef.current.toDataURL('image/jpeg', 0.92))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [drawFrameOverlay, finishCapture])

  const download = (dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `graduation-2026-${Date.now()}.jpg`
    a.click()
  }

  const toggleSticker = (s: string) => {
    setSelectedStickers((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 5 ? [...prev, s] : prev
    )
  }

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />

      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-white">📸 Photo Booth</h1>
          <p className="text-white/50 mt-2">Capture your graduation moment with custom frames & stickers</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera */}
          <div className="lg:col-span-2 space-y-4">
            {/* Viewfinder */}
            <div
              className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 flex items-center justify-center"
              style={{ borderColor: selectedFrame.borderColor, background: selectedFrame.bgColor || 'rgba(0,0,0,0.5)' }}
            >
              {stream ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  {/* Corner stickers overlay */}
                  <div className="absolute inset-3 pointer-events-none">
                    <span className="absolute top-0 left-0 text-3xl">{selectedFrame.cornerEmoji}</span>
                    <span className="absolute top-0 right-0 text-3xl">{selectedFrame.cornerEmoji}</span>
                    <span className="absolute bottom-0 left-0 text-3xl">{selectedFrame.cornerEmoji}</span>
                    <span className="absolute bottom-0 right-0 text-3xl">{selectedFrame.cornerEmoji}</span>
                  </div>
                  {/* Countdown */}
                  <AnimatePresence>
                    {countdown !== null && (
                      <motion.div
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-9xl font-bold text-white drop-shadow-2xl">{countdown}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Bottom label overlay */}
                  <div className="absolute bottom-3 left-0 right-0 text-center" style={{ color: selectedFrame.borderColor }}>
                    <span className="text-sm font-serif font-bold drop-shadow-lg">{UNI_NAME} · Graduation {YEAR}</span>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl">📷</div>
                  <p className="text-white/50">Camera not active</p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 rounded-xl bg-gold text-navy font-bold hover:bg-gold-light transition-colors"
                    >
                      Start Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 rounded-xl glass text-white font-bold hover:bg-white/10 transition-colors"
                    >
                      Upload a Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

            {/* Camera controls */}
            {stream && (
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={stopCamera} className="p-3 glass rounded-xl hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </button>
                <button
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gold text-navy font-bold text-lg hover:bg-gold-light transition-all disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  {countdown !== null ? `${countdown}...` : 'Take Photo'}
                </button>
                <button onClick={capturePhoto} className="p-3 glass rounded-xl hover:bg-white/10 transition-colors" title="Instant capture">
                  <RefreshCw className="w-5 h-5 text-white/50" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 rounded-xl glass text-sm text-white/60 hover:text-white transition-colors"
                >
                  Upload Instead
                </button>
              </div>
            )}

            {/* Last captured */}
            {captured && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <img src={captured.dataUrl} alt="Captured" className="w-32 h-24 object-cover rounded-xl" />
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-2">Photo captured! 🎉</p>
                    <div className="flex gap-2">
                      <button onClick={() => download(captured.dataUrl)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold-light transition-colors">
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-sm text-white/60 hover:text-white transition-colors">
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar: frames + stickers */}
          <div className="space-y-5">
            {/* Frames */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3">Choose Frame</h3>
              <div className="space-y-2">
                {FRAMES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${
                      selectedFrame.id === frame.id ? 'border text-white' : 'hover:bg-white/5 text-white/60'
                    }`}
                    style={selectedFrame.id === frame.id ? { borderColor: frame.borderColor, backgroundColor: frame.bgColor } : {}}
                  >
                    <span className="text-2xl">{frame.emoji}</span>
                    <span>{frame.label}</span>
                    <div className="ml-auto w-5 h-5 rounded-full border-2" style={{ borderColor: frame.borderColor }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Stickers */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-1">Add Stickers</h3>
              <p className="text-xs text-white/30 mb-3">Up to 5 stickers</p>
              <div className="grid grid-cols-6 gap-2">
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSticker(s)}
                    className={`text-2xl p-1.5 rounded-lg transition-all hover:scale-110 ${selectedStickers.includes(s) ? 'bg-gold/20 border border-gold/40' : 'hover:bg-white/5'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {selectedStickers.length > 0 && (
                <button onClick={() => setSelectedStickers([])} className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors">
                  Clear stickers
                </button>
              )}
            </div>

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3">Your Photos ({gallery.length})</h3>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img src={photo.dataUrl} alt="" className="w-full aspect-square object-cover rounded-lg" />
                      <button
                        onClick={() => download(photo.dataUrl)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
