'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Settings, Users, Radio, Link as LinkIcon, Trash2, Plus, LogOut, ChevronRight, Mic, Map, Camera, Edit2, Save, X } from 'lucide-react'
import { useGraduationStore } from '../../store/useGraduationStore'
import { useVenueStore, SceneId } from '../../store/useVenueStore'
import { useHallStore, HofGraduate } from '../../store/useHallStore'

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const submit = () => { if (!onLogin(pw)) setErr('Incorrect password') }
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#0a1440,#0f2060)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl p-8 max-w-sm w-full"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(16px)' }}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Lock className="w-7 h-7" style={{ color: '#D4AF37' }} />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-white/40 text-sm mt-1">Nextora Academy · Graduation 2026</p>
        </div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Enter admin password"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none mb-3"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          autoFocus />
        {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
        <button onClick={submit}
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{ background: '#D4AF37', color: '#0a1440' }}>
          Sign In
        </button>
        <p className="text-center text-xs text-white/20 mt-4">Default password: admin123</p>
      </motion.div>
    </div>
  )
}

// ── Venue / Hotspot Tab ───────────────────────────────────────────────────────
function VenueTab() {
  const { scenes, bbbUrl, bbbYaw, bbbPitch, bbbWidth, bbbHeight,
    updateScene, updateHotspot, addHotspot, removeHotspot,
    setBbbUrl, setBbbPosition, setBbbSize } = useVenueStore()

  const [selectedScene, setSelectedScene] = useState<SceneId>('lobby')
  const [bbbInput, setBbbInput] = useState(bbbUrl)
  const [bbbYawI, setBbbYawI] = useState(String(bbbYaw))
  const [bbbPitchI, setBbbPitchI] = useState(String(bbbPitch))
  const [bbbWI, setBbbWI] = useState(String(bbbWidth))
  const [bbbHI, setBbbHI] = useState(String(bbbHeight))
  const [saved, setSaved] = useState('')

  const sceneConfig = scenes.find(s => s.id === selectedScene)!

  const saveField = (label: string, fn: () => void) => {
    fn(); setSaved(label); setTimeout(() => setSaved(''), 1800)
  }

  const newHotspot = () => {
    const id = `hs-${Date.now()}`
    addHotspot(selectedScene, {
      id, label: 'New Hotspot', sublabel: '', icon: '📍',
      yaw: 0, pitch: 0, action: 'route', target: '/', color: '#D4AF37',
    })
  }

  return (
    <div className="space-y-5">
      {/* Scene selector */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Map className="w-4 h-4" style={{ color: '#D4AF37' }} /> Scenes</h3>
        <div className="flex gap-2 mb-4">
          {(['lobby','auditorium'] as SceneId[]).map(s => (
            <button key={s} onClick={() => setSelectedScene(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${selectedScene === s ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={selectedScene === s ? { background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37' } : { border: '1px solid rgba(255,255,255,0.1)' }}>
              {s === 'lobby' ? '🏛️ Lobby' : '🎭 Auditorium'}
            </button>
          ))}
        </div>

        {/* Scene image/video URL */}
        <label className="text-xs text-white/40 uppercase tracking-wider">Panorama URL ({sceneConfig.type})</label>
        <div className="flex gap-2 mt-1">
          <input defaultValue={sceneConfig.src}
            onBlur={e => saveField('Panorama URL', () => updateScene(selectedScene, { src: e.target.value }))}
            className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <span className="px-2 py-1 text-xs rounded-lg self-center"
            style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
            {saved === 'Panorama URL' ? '✓ Saved' : 'blur to save'}
          </span>
        </div>

        {/* Initial camera direction */}
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Initial Yaw°</label>
            <input type="number" defaultValue={sceneConfig.initialYaw}
              onBlur={e => saveField('Camera', () => updateScene(selectedScene, { initialYaw: Number(e.target.value) }))}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Initial Pitch°</label>
            <input type="number" defaultValue={sceneConfig.initialPitch}
              onBlur={e => saveField('Camera', () => updateScene(selectedScene, { initialPitch: Number(e.target.value) }))}
              className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
          </div>
        </div>
      </div>

      {/* Hotspots */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">📍 Hotspots — {sceneConfig.title}</h3>
          <button onClick={newHotspot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <p className="text-xs text-white/30 mb-3">Adjust yaw (left/right) and pitch (up/down) to position hotspots on the panorama wall.</p>

        <div className="space-y-3">
          {sceneConfig.hotspots.map(hs => (
            <div key={hs.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{hs.icon}</span>
                <input defaultValue={hs.label}
                  onBlur={e => updateHotspot(selectedScene, hs.id, { label: e.target.value })}
                  className="flex-1 px-2 py-1 rounded-lg text-sm text-white font-semibold outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <input defaultValue={hs.icon}
                  onBlur={e => updateHotspot(selectedScene, hs.id, { icon: e.target.value })}
                  className="w-12 px-2 py-1 rounded-lg text-center text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#D4AF37' }} />
                <button onClick={() => removeHotspot(selectedScene, hs.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500/40 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-white/40">Yaw°</label>
                  <input type="number" defaultValue={hs.yaw}
                    onBlur={e => updateHotspot(selectedScene, hs.id, { yaw: Number(e.target.value) })}
                    className="w-full mt-0.5 px-2 py-1 rounded-lg text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div>
                  <label className="text-white/40">Pitch°</label>
                  <input type="number" defaultValue={hs.pitch}
                    onBlur={e => updateHotspot(selectedScene, hs.id, { pitch: Number(e.target.value) })}
                    className="w-full mt-0.5 px-2 py-1 rounded-lg text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div>
                  <label className="text-white/40">Action</label>
                  <select defaultValue={hs.action}
                    onChange={e => updateHotspot(selectedScene, hs.id, { action: e.target.value as 'scene'|'route' })}
                    className="w-full mt-0.5 px-1 py-1 rounded-lg text-white outline-none text-xs"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <option value="scene">Scene</option>
                    <option value="route">Route</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/40">Target</label>
                  <input defaultValue={hs.target}
                    onBlur={e => updateHotspot(selectedScene, hs.id, { target: e.target.value })}
                    className="w-full mt-0.5 px-2 py-1 rounded-lg text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BBB Screen Config */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4" style={{ color: '#D4AF37' }} /> Live Stream Screen (Auditorium)
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider">BigBlueButton URL</label>
            <div className="flex gap-2 mt-1">
              <input value={bbbInput} onChange={e => setBbbInput(e.target.value)}
                placeholder="https://bbb-server.com/bigbluebutton/api/join?..."
                className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
              <button onClick={() => saveField('BBB', () => setBbbUrl(bbbInput))}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: saved === 'BBB' ? '#22c55e' : '#D4AF37', color: '#0a1440' }}>
                {saved === 'BBB' ? '✓' : 'Save'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider">Screen Yaw° (0 = center stage)</label>
              <div className="flex gap-2 mt-1">
                <input type="number" value={bbbYawI} onChange={e => setBbbYawI(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <button onClick={() => saveField('Pos', () => setBbbPosition(Number(bbbYawI), Number(bbbPitchI)))}
                  className="px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                  {saved === 'Pos' ? '✓' : 'Set'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider">Screen Pitch°</label>
              <input type="number" value={bbbPitchI} onChange={e => setBbbPitchI(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider">Screen Width (px)</label>
              <div className="flex gap-2 mt-1">
                <input type="number" value={bbbWI} onChange={e => setBbbWI(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <button onClick={() => saveField('Size', () => setBbbSize(Number(bbbWI), Number(bbbHI)))}
                  className="px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                  {saved === 'Size' ? '✓' : 'Set'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider">Screen Height (px)</label>
              <input type="number" value={bbbHI} onChange={e => setBbbHI(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Hall of Fame Tab ──────────────────────────────────────────────────────────
function HallTab() {
  const { graduates, addGraduate, updateGraduate, removeGraduate } = useHallStore()
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<HofGraduate>>({})
  const [adding, setAdding] = useState(false)
  const [newData, setNewData] = useState<Partial<HofGraduate>>({})

  const startEdit = (g: HofGraduate) => {
    setEditing(g.id); setEditData({ ...g })
  }
  const saveEdit = () => {
    if (editing) { updateGraduate(editing, editData); setEditing(null) }
  }
  const saveNew = () => {
    if (!newData.name || !newData.level) return
    addGraduate({
      id: `g-${Date.now()}`,
      name: newData.name ?? '',
      level: newData.level ?? 'UKG → Year 1',
      subject: newData.subject ?? '',
      photoUrl: newData.photoUrl ?? null,
      dream: newData.dream ?? '',
      memory: newData.memory ?? '',
      teacherMsg: newData.teacherMsg ?? '',
      parentMsg: newData.parentMsg ?? '',
      honors: newData.honors ?? '',
    })
    setAdding(false); setNewData({})
  }

  const LEVELS = ['UKG → Year 1','Year 6 → Year 7','Year 9 → Year 10'] as const

  const Field = ({ label, val, onChange }: { label: string; val: string; onChange: (v: string) => void }) => (
    <div>
      <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
      <input value={val} onChange={e => onChange(e.target.value)}
        className="w-full mt-0.5 px-3 py-2 rounded-xl text-sm text-white outline-none"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">{graduates.length} graduates · click to edit</p>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37' }}>
          <Plus className="w-4 h-4" /> Add Graduate
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)' }}>
          <p className="text-white font-semibold">New Graduate</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name *" val={newData.name ?? ''} onChange={v => setNewData(d => ({ ...d, name: v }))} />
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider">Year Level *</label>
              <select value={newData.level ?? ''} onChange={e => setNewData(d => ({ ...d, level: e.target.value as HofGraduate['level'] }))}
                className="w-full mt-0.5 px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <option value="">Select level</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <Field label="Subject" val={newData.subject ?? ''} onChange={v => setNewData(d => ({ ...d, subject: v }))} />
            <Field label="Honors" val={newData.honors ?? ''} onChange={v => setNewData(d => ({ ...d, honors: v }))} />
            <Field label="Photo URL (optional)" val={newData.photoUrl ?? ''} onChange={v => setNewData(d => ({ ...d, photoUrl: v }))} />
            <Field label="Dream" val={newData.dream ?? ''} onChange={v => setNewData(d => ({ ...d, dream: v }))} />
          </div>
          <Field label="Favourite Memory" val={newData.memory ?? ''} onChange={v => setNewData(d => ({ ...d, memory: v }))} />
          <Field label="Teacher Message" val={newData.teacherMsg ?? ''} onChange={v => setNewData(d => ({ ...d, teacherMsg: v }))} />
          <Field label="Parent Message" val={newData.parentMsg ?? ''} onChange={v => setNewData(d => ({ ...d, parentMsg: v }))} />
          <div className="flex gap-2">
            <button onClick={saveNew} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: '#D4AF37', color: '#0a1440' }}>Save</button>
            <button onClick={() => { setAdding(false); setNewData({}) }} className="px-5 py-2 rounded-xl text-sm font-bold text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          </div>
        </div>
      )}

      {graduates.map(g => (
        <div key={g.id} className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {editing === g.id ? (
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" val={editData.name ?? ''} onChange={v => setEditData(d => ({ ...d, name: v }))} />
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider">Year Level</label>
                  <select value={editData.level ?? ''} onChange={e => setEditData(d => ({ ...d, level: e.target.value as HofGraduate['level'] }))}
                    className="w-full mt-0.5 px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <Field label="Subject" val={editData.subject ?? ''} onChange={v => setEditData(d => ({ ...d, subject: v }))} />
                <Field label="Honors" val={editData.honors ?? ''} onChange={v => setEditData(d => ({ ...d, honors: v }))} />
                <Field label="Photo URL" val={editData.photoUrl ?? ''} onChange={v => setEditData(d => ({ ...d, photoUrl: v || null }))} />
                <Field label="Dream" val={editData.dream ?? ''} onChange={v => setEditData(d => ({ ...d, dream: v }))} />
              </div>
              <Field label="Favourite Memory" val={editData.memory ?? ''} onChange={v => setEditData(d => ({ ...d, memory: v }))} />
              <Field label="Teacher Message" val={editData.teacherMsg ?? ''} onChange={v => setEditData(d => ({ ...d, teacherMsg: v }))} />
              <Field label="Parent Message" val={editData.parentMsg ?? ''} onChange={v => setEditData(d => ({ ...d, parentMsg: v }))} />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold" style={{ background: '#D4AF37', color: '#0a1440' }}><Save className="w-3.5 h-3.5" /> Save</button>
                <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white/50" style={{ border: '1px solid rgba(255,255,255,0.1)' }}><X className="w-3.5 h-3.5" /> Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{ background: 'rgba(212,175,55,0.2)' }}>
                {g.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{g.name}</p>
                <p className="text-white/40 text-xs truncate">{g.level} · {g.honors || 'No award'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(g)}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => removeGraduate(g.id)}
                  className="p-2 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Ceremony Tab ──────────────────────────────────────────────────────────────
function CeremonyTab() {
  const { ceremonyStatus, setCeremonyStatus, attendeeCount, setAttendeeCount,
    virtualAttendees, nextSpeaker, dismissSpeaker, currentSpeakerId, speakerQueue } = useGraduationStore()

  const statusColors = {
    before: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    live:   'bg-red-500/20 border-red-500/40 text-red-400',
    ended:  'bg-gray-500/20 border-gray-500/40 text-gray-400',
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Radio className="w-4 h-4" style={{ color: '#D4AF37' }} /> Ceremony Status</h3>
        <div className="flex gap-3">
          {(['before','live','ended'] as const).map(s => (
            <button key={s} onClick={() => setCeremonyStatus(s)}
              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${ceremonyStatus === s ? statusColors[s] : 'text-white/40 hover:text-white border-white/10'}`}>
              {s === 'before' ? '⏳ Before' : s === 'live' ? '🔴 Live' : '✅ Ended'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" style={{ color: '#D4AF37' }} /> Attendee Count</h3>
        <div className="flex items-center gap-4">
          <button onClick={() => setAttendeeCount(Math.max(0, attendeeCount - 1))}
            className="w-9 h-9 rounded-xl text-white font-bold text-lg" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>−</button>
          <span className="text-white text-2xl font-bold w-16 text-center">{attendeeCount}</span>
          <button onClick={() => setAttendeeCount(attendeeCount + 1)}
            className="w-9 h-9 rounded-xl text-white font-bold text-lg" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>+</button>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Mic className="w-4 h-4" style={{ color: '#D4AF37' }} /> Virtual Stage</h3>
        {currentSpeakerId ? (
          <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div>
              <p className="text-sm font-semibold text-red-400">Currently Speaking</p>
              <p className="text-white">{virtualAttendees.find(a => a.id === currentSpeakerId)?.name}</p>
            </div>
            <button onClick={dismissSpeaker} className="px-4 py-2 rounded-xl text-sm font-bold text-red-400" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>End Turn</button>
          </div>
        ) : <p className="text-white/40 text-sm mb-4">No one on stage</p>}
        {speakerQueue.length > 0 && (
          <>
            <div className="space-y-2 mb-3">
              {speakerQueue.map((id, i) => {
                const a = virtualAttendees.find(x => x.id === id)
                return a ? (
                  <div key={id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-white/30 text-sm">{i+1}.</span>
                    <span className="text-white text-sm">{a.name}</span>
                    <span className="text-xs text-white/30">{a.role}</span>
                  </div>
                ) : null
              })}
            </div>
            <button onClick={nextSpeaker}
              className="w-full py-2.5 rounded-xl text-sm font-bold"
              style={{ background: '#D4AF37', color: '#0a1440' }}>
              Call Next Speaker →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { isAdminAuthenticated, loginAdmin, logoutAdmin } = useGraduationStore()
  const [tab, setTab] = useState<'ceremony' | 'venue' | 'hall'>('ceremony')

  if (!isAdminAuthenticated) {
    return <LoginScreen onLogin={(pw) => loginAdmin(pw)} />
  }

  const TABS = [
    { id: 'ceremony' as const, label: 'Ceremony', icon: '🎓' },
    { id: 'venue' as const,    label: 'Venue & Hotspots', icon: '🗺️' },
    { id: 'hall' as const,     label: 'Hall of Fame', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen pb-16" style={{ background: 'linear-gradient(135deg,#0a1440,#0f2060,#0a1440)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(8,16,60,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '1px solid #D4AF37' }}>🎓</div>
          <div>
            <p className="text-white font-bold text-xs">NEXTORA ACADEMY</p>
            <p className="text-xs" style={{ color: '#D4AF37' }}>Admin Panel</p>
          </div>
        </div>
        <button onClick={logoutAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/50 hover:text-white transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={tab === t.id ? { background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37' } : { border: '1px solid rgba(255,255,255,0.1)' }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === 'ceremony' && <CeremonyTab />}
        {tab === 'venue'    && <VenueTab />}
        {tab === 'hall'     && <HallTab />}
      </div>
    </div>
  )
}
