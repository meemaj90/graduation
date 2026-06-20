'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiEffectProps {
  trigger?: boolean
  onComplete?: () => void
}

export default function ConfettiEffect({ trigger = true, onComplete }: ConfettiEffectProps) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!trigger || firedRef.current) return
    firedRef.current = true

    const duration = 4000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E8720C', '#F0D060', '#ffffff', '#A88A20', '#F97316'],
        gravity: 0.9,
        scalar: 1.2,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E8720C', '#F0D060', '#ffffff', '#A88A20', '#F97316'],
        gravity: 0.9,
        scalar: 1.2,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      } else {
        onComplete?.()
      }
    }

    frame()
  }, [trigger, onComplete])

  return null
}

export function triggerConfetti() {
  const count = 200
  const defaults = { origin: { y: 0.7 } }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#E8720C', '#F0D060', '#ffffff', '#A88A20', '#F97316'],
    })
  }

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}
