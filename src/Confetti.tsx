import { useEffect, useRef } from 'react'
import { motionLevel } from './motion/motion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotSpeed: number
  shape: 'star' | 'circle' | 'rect'
  alpha: number
}

const COLORS = ['#FF5964', '#FFD166', '#06D6A0', '#118AB2', '#9D4EDD', '#F72585', '#4CC9F0']

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active || motionLevel() !== 'full') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const w = (canvas.width = window.innerWidth)
    const h = (canvas.height = window.innerHeight)

    const particles: Particle[] = []
    const count = 70

    for (let i = 0; i < count; i++) {
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: h / 2 - 50,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 12 + 8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.6 ? 'star' : Math.random() > 0.3 ? 'rect' : 'circle',
        alpha: 1,
      })
    }

    let frame = 0
    function drawStar(c: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
      c.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y)
        const a2 = a + Math.PI / 5
        c.lineTo(cx + Math.cos(a2) * (r * 0.4), cy + Math.sin(a2) * (r * 0.4))
      }
      c.closePath()
      c.fill()
    }

    function render() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, w, h)
      frame++

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.35 // Trọng lực
        p.vx *= 0.98
        p.rotation += p.rotSpeed
        if (frame > 60) p.alpha -= 0.015

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.alpha)

        if (p.shape === 'star') {
          drawStar(ctx, 0, 0, p.size)
        } else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7)
        }
        ctx.restore()
      })

      if (particles.some((p) => p.alpha > 0.05 && p.y < h + 50)) {
        animId = requestAnimationFrame(render)
      }
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99,
      }}
    />
  )
}
