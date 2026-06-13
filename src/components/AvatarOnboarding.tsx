'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Check, ChevronRight, User, GraduationCap } from 'lucide-react'
import { useGraduationStore } from '../store/useGraduationStore'
import AvatarDisplay from './AvatarDisplay'
import { AvatarCustomization } from '../types'

const SKIN_TONES = ['#FDBCB4', '#F5CBA7', '#C68642', '#8D5524', '#5C3317']
const HAIR_COLORS = ['#1C1008', '#2C1810', '#8B4513', '#808080', '#FFD700', '#C41E3A', '#000000']

const GOWN_DEFAULTS: Partial<AvatarCustomization> = {
  outfit: 'gown',
  outfitColor: '#1a237e',
  capColor: '#1a237e',
}

interface Props {
  onComplete: () => void
}

type Step = 'name' | 'role' | 'appearance' | 'photo'

export default function AvatarOnboarding({ onComplete }: Props) {
  const { setMyName, setMyRole, setMyAvatar, myAvatar, myName, myRole } = useGraduationStore()

  const [step, setStep] = useState<Step>('name')
  const [localName, setLocalName] = useState(myName || '')
  const [localRole, setLocalRole] = useState<'graduate' | 'guest' | 'faculty'>(myRole || 'guest')
  const [localAvatar, setLocalAvatar] = useState<AvatarCustomization>({ ...myAvatar })
  const [photoMode, setPhotoMode] = useState<'none' | 'camera' | 'upload'>('none')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      setCameraStream(stream)
      setPhotoMode('camera')
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      alert('Camera not available. Please use file upload.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setPhotoMode('none')
  }, [cameraStream])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, 200, 200)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setLocalAvatar(a => ({ ...a, photoUrl: dataUrl, usePhoto: true }))
    stopCamera()
  }, [stopCamera])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      // Crop to square using canvas
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const size = Math.min(img.width, img.height)
        canvas.width = 200
        canvas.height = 200
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 200, 200)
        const cropped = canvas.toDataURL('image/jpeg', 0.8)
        setLocalAvatar(a => ({ ...a, photoUrl: cropped, usePhoto: true }))
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRoleSelect = (role: 'graduate' | 'guest' | 'faculty') => {
    setLocalRole(role)
    if (role === 'graduate') {
      setLocalAvatar(a => ({ ...a, ...GOWN_DEFAULTS }))
    } else {
      setLocalAvatar(a => ({ ...a, outfit: 'suit', capColor: '#000000' }))
    }
  }

  const finish = () => {
    setMyName(localName.trim() || 'Guest')
    setMyRole(localRole)
    setMyAvatar(localAvatar)
    onComplete()
  }

  const steps: Step[] = ['name', 'role', 'appearance', 'photo']
  const stepIdx = steps.indexOf(step)

  const previewAvatar = { ...localAvatar }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,4,15,0.92)', backdropFilter: 'blur(16px)' }}>

      {/* Hidden canvas for photo processing */}
      <canvas ref={canvasRef} className="hidden" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0820, #120a2e)', border: '1px solid rgba(139,92,246,0.3)' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Welcome to Graduation</h2>
            <div className="flex gap-1.5">
              {steps.map((s, i) => (
                <div key={s} className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === stepIdx ? 24 : 8,
                    background: i <= stepIdx ? 'linear-gradient(90deg, #7c3aed, #D4AF37)' : 'rgba(255,255,255,0.1)'
                  }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left: Avatar preview */}
          <div className="w-36 flex-shrink-0 flex flex-col items-center justify-center py-8 px-4"
            style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <AvatarDisplay avatar={previewAvatar} size={96} name={localName || undefined} />
            {localName && (
              <p className="mt-2 text-xs text-center text-white/60 font-medium truncate w-full px-1">{localName}</p>
            )}
            {localRole === 'graduate' && (
              <span className="mt-1.5 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                🎓 Graduate
              </span>
            )}
          </div>

          {/* Right: Step content */}
          <div className="flex-1 p-6">
            <AnimatePresence mode="wait">
              {step === 'name' && (
                <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-xs text-purple-300 uppercase tracking-widest mb-1">Step 1</p>
                  <h3 className="text-white font-semibold text-base mb-4">What's your name?</h3>
                  <input
                    autoFocus
                    type="text"
                    value={localName}
                    onChange={e => setLocalName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && localName.trim() && setStep('role')}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.3)' }}
                  />
                  <button onClick={() => setStep('role')} disabled={!localName.trim()}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-40 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #D4AF37)' }}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 'role' && (
                <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-xs text-purple-300 uppercase tracking-widest mb-1">Step 2</p>
                  <h3 className="text-white font-semibold text-base mb-4">Are you graduating today?</h3>
                  <div className="space-y-2.5">
                    {([
                      { role: 'graduate' as const, label: "🎓 Yes — I'm a Graduate!", desc: 'Wear graduation gown & cap automatically', color: '#D4AF37' },
                      { role: 'guest' as const, label: '👨‍👩‍👧 Guest / Family', desc: 'Here to celebrate and support', color: '#7c3aed' },
                      { role: 'faculty' as const, label: '👩‍🏫 Faculty / Staff', desc: 'University staff member', color: '#3b82f6' },
                    ]).map(opt => (
                      <button key={opt.role} onClick={() => handleRoleSelect(opt.role)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                        style={{
                          background: localRole === opt.role ? `${opt.color}18` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${localRole === opt.role ? opt.color + '60' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                        <span className="text-lg">{opt.label.split(' ')[0]}</span>
                        <div>
                          <p className="text-white text-xs font-semibold">{opt.label.split(' ').slice(1).join(' ')}</p>
                          <p className="text-white/40 text-xs">{opt.desc}</p>
                        </div>
                        {localRole === opt.role && <Check className="w-4 h-4 ml-auto" style={{ color: opt.color }} />}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep('appearance')}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #D4AF37)' }}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-xs text-purple-300 uppercase tracking-widest mb-1">Step 3</p>
                  <h3 className="text-white font-semibold text-base mb-4">Customise your look</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-white/50 text-xs mb-2">Skin Tone</p>
                      <div className="flex gap-2">
                        {SKIN_TONES.map(t => (
                          <button key={t} onClick={() => setLocalAvatar(a => ({ ...a, skinTone: t }))}
                            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ background: t, borderColor: localAvatar.skinTone === t ? '#D4AF37' : 'transparent' }} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-white/50 text-xs mb-2">Hair Style</p>
                      <div className="flex gap-2 flex-wrap">
                        {['short', 'long', 'curly', 'bun', 'none'].map(s => (
                          <button key={s} onClick={() => setLocalAvatar(a => ({ ...a, hairStyle: s }))}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                            style={{
                              background: localAvatar.hairStyle === s ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)',
                              border: `1px solid ${localAvatar.hairStyle === s ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                              color: localAvatar.hairStyle === s ? '#fff' : 'rgba(255,255,255,0.5)',
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-white/50 text-xs mb-2">Hair Color</p>
                      <div className="flex gap-2">
                        {HAIR_COLORS.map(c => (
                          <button key={c} onClick={() => setLocalAvatar(a => ({ ...a, hairColor: c }))}
                            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ background: c, borderColor: localAvatar.hairColor === c ? '#D4AF37' : 'transparent' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setStep('photo')}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #D4AF37)' }}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 'photo' && (
                <motion.div key="photo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-xs text-purple-300 uppercase tracking-widest mb-1">Step 4</p>
                  <h3 className="text-white font-semibold text-base mb-1">Add your photo</h3>
                  <p className="text-white/40 text-xs mb-4">Optional — makes your avatar more personal</p>

                  {photoMode === 'camera' ? (
                    <div className="relative">
                      <video ref={videoRef} className="w-full rounded-xl" style={{ maxHeight: 160, objectFit: 'cover' }} autoPlay muted playsInline />
                      <div className="flex gap-2 mt-2">
                        <button onClick={capturePhoto}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #D4AF37)' }}>
                          📸 Capture
                        </button>
                        <button onClick={stopCamera}
                          className="px-4 py-2.5 rounded-xl text-sm text-white/50 border"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : localAvatar.photoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={localAvatar.photoUrl} alt="Your photo"
                        className="w-20 h-20 rounded-full object-cover"
                        style={{ border: '2px solid #D4AF37' }} />
                      <button onClick={() => setLocalAvatar(a => ({ ...a, photoUrl: undefined, usePhoto: false }))}
                        className="text-xs text-white/40 hover:text-white/60 underline">
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={startCamera}
                        className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all hover:border-purple-500/50"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Camera className="w-5 h-5 text-purple-400" />
                        <span className="text-xs text-white/60">Take Photo</span>
                      </button>
                      <button onClick={() => fileRef.current?.click()}
                        className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border transition-all hover:border-purple-500/50"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Upload className="w-5 h-5 text-purple-400" />
                        <span className="text-xs text-white/60">Upload</span>
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button onClick={finish}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #D4AF37 100%)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>
                      🎓 Enter Graduation Hall
                    </button>
                  </div>
                  <button onClick={finish} className="mt-2 w-full text-center text-xs text-white/25 hover:text-white/50 transition-colors">
                    Skip photo — enter without
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
