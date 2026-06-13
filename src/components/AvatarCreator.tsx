'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, RefreshCw, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { AvatarCustomization } from '../types'
import AvatarDisplay from './AvatarDisplay'

const SKIN_TONES = ['#FDBCB4', '#F5CBA7', '#E8B89A', '#C68642', '#8D5524', '#4A2912']
const HAIR_STYLES = ['short', 'long', 'curly', 'bun', 'afro', 'bald']
const HAIR_COLORS = ['#1C1008', '#2C1810', '#8B4513', '#D4A017', '#C0C0C0', '#808080', '#FF4500', '#000000']
const OUTFITS = ['gown', 'suit', 'dress', 'traditional']
const OUTFIT_COLORS = ['#1a237e', '#0d47a1', '#1b5e20', '#4a148c', '#b71c1c', '#000000', '#37474f', '#BF9B30']
const CAP_COLORS = ['#1a237e', '#000000', '#8B0000', '#006400', '#4a148c', '#BF9B30']
const ACCESSORIES = ['none', 'glasses', 'sunglasses', 'earrings', 'necklace']

interface Step {
  id: string
  label: string
  icon: string
}

const STEPS: Step[] = [
  { id: 'photo', label: 'Photo', icon: '📷' },
  { id: 'skin', label: 'Skin', icon: '✋' },
  { id: 'hair', label: 'Hair', icon: '💇' },
  { id: 'outfit', label: 'Outfit', icon: '👔' },
  { id: 'cap', label: 'Cap', icon: '🎓' },
  { id: 'accessory', label: 'Extras', icon: '💎' },
]

interface AvatarCreatorProps {
  initial: AvatarCustomization
  onSave: (avatar: AvatarCustomization) => void
  onClose?: () => void
}

export default function AvatarCreator({ initial, onSave, onClose }: AvatarCreatorProps) {
  const [avatar, setAvatar] = useState<AvatarCustomization>(initial)
  const [step, setStep] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial.photoUrl ?? null)
  const [cameraActive, setCameraActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const set = useCallback((patch: Partial<AvatarCustomization>) => {
    setAvatar((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setPhotoPreview(url)
      set({ photoUrl: url, usePhoto: true })
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      alert('Camera access denied. Please upload a photo instead.')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!
    canvasRef.current.width = 400
    canvasRef.current.height = 400
    ctx.drawImage(videoRef.current, 0, 0, 400, 400)
    const url = canvasRef.current.toDataURL('image/jpeg', 0.8)
    setPhotoPreview(url)
    set({ photoUrl: url, usePhoto: true })
    stopCamera()
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    set({ photoUrl: undefined, usePhoto: false })
    stopCamera()
  }

  const currentStep = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-3xl border border-gold/20 w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="font-bold text-white text-lg">Create Your Avatar</h2>
            <p className="text-xs text-white/40">Personalise how you appear in the virtual ceremony</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5 text-white/50" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row">
          {/* Preview */}
          <div className="sm:w-56 flex flex-col items-center justify-center p-6 gap-4 border-b sm:border-b-0 sm:border-r border-white/5 bg-white/2">
            <div className="relative">
              <AvatarDisplay avatar={avatar} size={140} />
              {avatar.usePhoto && photoPreview && (
                <button
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <p className="text-xs text-white/30 text-center">Your avatar preview</p>
          </div>

          {/* Steps */}
          <div className="flex-1 p-6">
            {/* Step tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    i === step ? 'bg-gold text-navy' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {currentStep.id === 'photo' && (
                  <div className="space-y-4">
                    <p className="text-sm text-white/60">Use your real photo as your avatar face — ibentos style!</p>
                    
                    {cameraActive ? (
                      <div className="space-y-3">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl aspect-square object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-3">
                          <button onClick={capturePhoto} className="flex-1 py-2.5 rounded-xl bg-gold text-navy font-semibold text-sm flex items-center justify-center gap-2">
                            <Camera className="w-4 h-4" /> Capture
                          </button>
                          <button onClick={stopCamera} className="px-4 py-2.5 rounded-xl glass text-white/60 text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : photoPreview ? (
                      <div className="space-y-3">
                        <div className="relative w-40 h-40 mx-auto">
                          <img src={photoPreview} alt="Preview" className="w-full h-full rounded-2xl object-cover border-2 border-gold/40" />
                          <div className="absolute inset-0 rounded-2xl border-2 border-gold/40" />
                        </div>
                        <div className="flex gap-3 justify-center">
                          <button onClick={removePhoto} className="px-4 py-2 rounded-xl glass text-sm text-red-400 flex items-center gap-1.5">
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl glass text-sm text-white/60 flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" /> Change
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={startCamera} className="flex flex-col items-center gap-2 p-5 rounded-2xl glass border border-white/5 hover:border-gold/30 transition-all text-sm text-white/60 hover:text-white">
                          <Camera className="w-8 h-8 text-gold" />
                          Take Photo
                        </button>
                        <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-2 p-5 rounded-2xl glass border border-white/5 hover:border-gold/30 transition-all text-sm text-white/60 hover:text-white">
                          <Upload className="w-8 h-8 text-gold" />
                          Upload Photo
                        </button>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    <p className="text-xs text-white/25">Or skip to use a cartoon avatar below</p>
                  </div>
                )}

                {currentStep.id === 'skin' && (
                  <div>
                    <p className="text-sm text-white/50 mb-4">Choose your skin tone</p>
                    <div className="flex gap-3 flex-wrap">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone}
                          onClick={() => set({ skinTone: tone })}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${avatar.skinTone === tone ? 'border-gold scale-110 shadow-lg shadow-gold/30' : 'border-transparent hover:border-white/30'}`}
                          style={{ backgroundColor: tone }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.id === 'hair' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-white/50 mb-3">Hair style</p>
                      <div className="flex flex-wrap gap-2">
                        {HAIR_STYLES.map((style) => (
                          <button
                            key={style}
                            onClick={() => set({ hairStyle: style })}
                            className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${avatar.hairStyle === style ? 'bg-gold text-navy font-semibold' : 'glass text-white/60 hover:text-white'}`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-3">Hair colour</p>
                      <div className="flex gap-2 flex-wrap">
                        {HAIR_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => set({ hairColor: color })}
                            className={`w-9 h-9 rounded-full border-2 transition-all ${avatar.hairColor === color ? 'border-gold scale-110' : 'border-transparent hover:border-white/30'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.id === 'outfit' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-white/50 mb-3">Outfit style</p>
                      <div className="flex flex-wrap gap-2">
                        {OUTFITS.map((o) => (
                          <button
                            key={o}
                            onClick={() => set({ outfit: o })}
                            className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${avatar.outfit === o ? 'bg-gold text-navy font-semibold' : 'glass text-white/60 hover:text-white'}`}
                          >
                            {o === 'gown' ? '🎓 Gown' : o === 'suit' ? '👔 Suit' : o === 'dress' ? '👗 Dress' : '🥻 Traditional'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-white/50 mb-3">Colour</p>
                      <div className="flex gap-2 flex-wrap">
                        {OUTFIT_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => set({ outfitColor: color })}
                            className={`w-9 h-9 rounded-full border-2 transition-all ${avatar.outfitColor === color ? 'border-gold scale-110' : 'border-transparent hover:border-white/30'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.id === 'cap' && (
                  <div>
                    <p className="text-sm text-white/50 mb-4">Graduation cap colour</p>
                    <div className="flex gap-3 flex-wrap">
                      {CAP_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => set({ capColor: color })}
                          className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${avatar.capColor === color ? 'border-gold scale-110 shadow-lg' : 'border-transparent hover:border-white/30'}`}
                          style={{ backgroundColor: color }}
                        >
                          <span className="text-lg">🎓</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.id === 'accessory' && (
                  <div>
                    <p className="text-sm text-white/50 mb-4">Add an accessory</p>
                    <div className="flex flex-wrap gap-2">
                      {ACCESSORIES.map((acc) => (
                        <button
                          key={acc}
                          onClick={() => set({ accessory: acc })}
                          className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${avatar.accessory === acc ? 'bg-gold text-navy font-semibold' : 'glass text-white/60 hover:text-white'}`}
                        >
                          {acc === 'none' ? '✕ None' : acc === 'glasses' ? '👓 Glasses' : acc === 'sunglasses' ? '🕶️ Shades' : acc === 'earrings' ? '💎 Earrings' : '📿 Necklace'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-white/50 disabled:opacity-30 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <span className="text-xs text-white/25">{step + 1} / {STEPS.length}</span>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-sm text-white hover:bg-white/15 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onSave(avatar)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-gold-light transition-colors"
                >
                  <Check className="w-4 h-4" /> Save Avatar
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
