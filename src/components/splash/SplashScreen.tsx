import { useEffect, useRef, useState } from 'react'

export type BootMode = 'animation_prompt' | 'animation_auto' | 'auto' | 'login'

interface Props {
  onEnter: () => void
  mode: BootMode
}

export default function SplashScreen({ onEnter, mode }: Props) {
  const ambientRef    = useRef<HTMLDivElement>(null)
  const centerGlowRef = useRef<HTMLDivElement>(null)
  const markBoxRef    = useRef<HTMLDivElement>(null)
  const revBlueRef    = useRef<SVGPathElement>(null)
  const revSilverRef  = useRef<SVGPathElement>(null)
  const latchFlashRef = useRef<HTMLDivElement>(null)
  const latchRingRef  = useRef<HTMLDivElement>(null)
  const wordmarkRef   = useRef<HTMLImageElement>(null)
  const w1Ref         = useRef<HTMLSpanElement>(null)
  const w2Ref         = useRef<HTMLSpanElement>(null)
  const w3Ref         = useRef<HTMLSpanElement>(null)

  const [showEnter, setShowEnter] = useState(false)
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' })
  const [loginErr, setLoginErr]   = useState('')
  const animsRef = useRef<Animation[]>([])

  const an = (el: Element | null, kf: Keyframe[], opt: KeyframeAnimationOptions) => {
    if (!el) return
    const a = el.animate(kf, { fill: 'forwards', ...opt })
    animsRef.current.push(a)
  }

  const play = () => {
    animsRef.current.forEach(a => { try { a.cancel() } catch (_) {} })
    animsRef.current = []

    if (revBlueRef.current)  { revBlueRef.current.style.strokeDashoffset  = '1' }
    if (revSilverRef.current) { revSilverRef.current.style.strokeDashoffset = '1' }

    an(centerGlowRef.current, [{ opacity: 0 }, { opacity: 0.16 }], { duration: 2100, delay: 360, easing: 'ease-out' })

    const revDelay = 900, revDur = 4050, revEase = 'cubic-bezier(.5,0,.2,1)'
    an(revBlueRef.current,   [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: revDur, delay: revDelay, easing: revEase })
    an(revSilverRef.current, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: revDur, delay: revDelay, easing: revEase })

    const latch = revDelay + revDur - 90
    an(latchFlashRef.current, [
      { opacity: 0, transform: 'translate(-50%,-50%) scale(0.3)' },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1.0)', offset: 0.4 },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(2.0)' },
    ], { duration: 1680, delay: latch - 180, easing: 'ease-out' })
    an(latchRingRef.current, [
      { opacity: 0.85, transform: 'translate(-50%,-50%) scale(0.4)' },
      { opacity: 0,    transform: 'translate(-50%,-50%) scale(2.5)' },
    ], { duration: 1920, delay: latch - 90, easing: 'cubic-bezier(.2,.7,.2,1)' })
    an(markBoxRef.current, [
      { transform: 'scale(1)' },
      { transform: 'scale(1.03)', offset: 0.42 },
      { transform: 'scale(1)' },
    ], { duration: 1560, delay: latch - 60, easing: 'cubic-bezier(.3,1.4,.5,1)' })
    an(centerGlowRef.current, [{ opacity: 0.16 }, { opacity: 0.48, offset: 0.3 }, { opacity: 0.34 }], { duration: 2160, delay: latch - 120, easing: 'ease-out' })

    an(wordmarkRef.current, [
      { opacity: 0, transform: 'translateY(16px)', filter: 'blur(5px)' },
      { opacity: 1, transform: 'translateY(0)',    filter: 'blur(0)'   },
    ], { duration: 1680, delay: 5940, easing: 'cubic-bezier(.2,.7,.2,1)' })

    const word = (el: Element | null, delay: number) => an(el, [
      { opacity: 0, filter: 'brightness(0.4) blur(2px)', transform: 'translateY(6px)' },
      { opacity: 1, filter: 'brightness(1.18) blur(0)',  transform: 'translateY(0)'   },
    ], { duration: 1290, delay, easing: 'cubic-bezier(.2,.75,.25,1)' })
    word(w1Ref.current, 6960)
    word(w2Ref.current, 7800)
    word(w3Ref.current, 8640)

    an(centerGlowRef.current, [{ opacity: 0.32 }, { opacity: 0.46 }, { opacity: 0.32 }], { duration: 10800, delay: 10080, iterations: Infinity, easing: 'ease-in-out' })
    an(markBoxRef.current,    [{ transform: 'scale(1)' }, { transform: 'scale(1.012)' }, { transform: 'scale(1)' }], { duration: 14400, delay: 10080, iterations: Infinity, easing: 'ease-in-out' })
    an(ambientRef.current,    [{ opacity: 0.9 }, { opacity: 1 }, { opacity: 0.9 }], { duration: 14400, delay: 10080, iterations: Infinity, easing: 'ease-in-out' })

    // after words finish, show enter button or auto-enter
    if (mode === 'animation_prompt') {
      setTimeout(() => setShowEnter(true), 9600)
    } else if (mode === 'animation_auto') {
      setTimeout(() => onEnter(), 10800)
    }
  }

  useEffect(() => {
    if (mode === 'auto') { onEnter(); return }
    const t = setTimeout(() => play(), 220)
    return () => {
      clearTimeout(t)
      animsRef.current.forEach(a => { try { a.cancel() } catch (_) {} })
    }
  }, [])

  if (mode === 'login') {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault()
      if (loginForm.user === 'admin' && loginForm.pass === 'divad') {
        onEnter()
      } else {
        setLoginErr('Invalid credentials. Contact your system administrator.')
      }
    }
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(125% 120% at 50% 44%, #0a1018 0%, #060a12 50%, #03060d 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani', sans-serif", zIndex: 9999 }}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />
        <img src="/boot/divad-wordmark.png" style={{ width: 260, marginBottom: 40, opacity: 0.95 }} alt="DIVAD OS" />
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 320 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', marginBottom: 4 }}>Internal Account Login</div>
          <input value={loginForm.user} onChange={e => setLoginForm(f => ({ ...f, user: e.target.value }))}
            placeholder="Username" autoFocus
            style={{ padding: '10px 14px', background: 'rgba(10,18,32,0.8)', border: '1px solid rgba(90,150,230,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 14, fontFamily: "'Rajdhani',sans-serif", outline: 'none', letterSpacing: '0.05em' }} />
          <input type="password" value={loginForm.pass} onChange={e => setLoginForm(f => ({ ...f, pass: e.target.value }))}
            placeholder="Password"
            style={{ padding: '10px 14px', background: 'rgba(10,18,32,0.8)', border: '1px solid rgba(90,150,230,0.3)', borderRadius: 8, color: '#e2e8f0', fontSize: 14, fontFamily: "'Rajdhani',sans-serif", outline: 'none', letterSpacing: '0.05em' }} />
          {loginErr && <div style={{ fontSize: 11, color: '#fca5a5', textAlign: 'center' }}>{loginErr}</div>}
          <button type="submit"
            style={{ padding: '11px', background: 'rgba(12,73,216,0.8)', border: '1px solid rgba(42,123,255,0.5)', borderRadius: 8, color: '#dceaff', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(125% 120% at 50% 44%, #0a1018 0%, #060a12 50%, #03060d 100%)', fontFamily: "'Rajdhani', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />

      <div ref={ambientRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(46% 40% at 50% 40%, rgba(28,80,190,0.10), transparent 72%)' }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div ref={centerGlowRef} style={{ position: 'absolute', left: '50%', top: '34%', width: '70vmin', height: '70vmin', transform: 'translate(-50%,-50%)', opacity: 0, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(40,120,255,0.4) 0%, rgba(26,80,190,0.14) 36%, transparent 64%)', filter: 'blur(4px)' }} />

        <div ref={markBoxRef} style={{ position: 'relative', width: 'clamp(300px,48vmin,740px)', aspectRatio: '760/440', transform: 'scale(1)' }}>
          <svg viewBox="0 0 760 440" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2a7bff" /><stop offset="0.5" stopColor="#0c49d8" /><stop offset="1" stopColor="#06277f" />
              </linearGradient>
              <linearGradient id="silverGrad" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f2f5fa" /><stop offset="0.5" stopColor="#9aa6b6" /><stop offset="1" stopColor="#566275" />
              </linearGradient>
              <clipPath id="topCross"><rect x="300" y="80" width="180" height="130" /></clipPath>
              <path id="leftRingBase" fillRule="evenodd" fill="url(#blueGrad)" stroke="#05080f" strokeWidth="7" strokeLinejoin="round"
                d="M120 60 L300 60 L455 205 L300 380 L120 380 Q70 380 70 330 L70 110 Q70 60 120 60 Z M168 132 L286 132 L364 210 L286 288 L168 288 Q142 288 142 268 L142 152 Q142 132 168 132 Z" />
              <path id="rightRingBase" fillRule="evenodd" fill="url(#silverGrad)" stroke="#05080f" strokeWidth="7" strokeLinejoin="round"
                d="M640 60 L460 60 L305 205 L460 380 L640 380 Q690 380 690 330 L690 110 Q690 60 640 60 Z M592 132 L474 132 L396 210 L474 288 L592 288 Q618 288 618 268 L618 152 Q618 132 592 132 Z" />
              <mask id="revealBlue" maskUnits="userSpaceOnUse" x="-60" y="-60" width="880" height="560">
                <path ref={revBlueRef} pathLength={1} fill="none" stroke="#fff" strokeWidth="108" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                  d="M345 295 L293 334 L144 334 Q106 334 106 300 L106 140 Q106 96 144 96 L293 96 L410 207 L345 295 Z" />
              </mask>
              <mask id="revealSilver" maskUnits="userSpaceOnUse" x="-60" y="-60" width="880" height="560">
                <path ref={revSilverRef} pathLength={1} fill="none" stroke="#fff" strokeWidth="108" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                  d="M415 145 L467 96 L616 96 Q654 96 654 140 L654 300 Q654 334 616 334 L467 334 L350 207 L415 145 Z" />
              </mask>
            </defs>
            <use href="#leftRingBase" mask="url(#revealBlue)" />
            <use href="#rightRingBase" mask="url(#revealSilver)" />
            <use href="#leftRingBase" mask="url(#revealBlue)" clipPath="url(#topCross)" />
          </svg>

          <div ref={latchRingRef} style={{ position: 'absolute', left: '50%', top: '50%', width: '24%', height: '46%', transform: 'translate(-50%,-50%) scale(0.4)', opacity: 0, pointerEvents: 'none', border: '2px solid rgba(150,200,255,0.85)', borderRadius: '50%', boxShadow: '0 0 24px rgba(70,150,255,0.6)' }} />
          <div ref={latchFlashRef} style={{ position: 'absolute', left: '50%', top: '50%', width: '40%', height: '66%', transform: 'translate(-50%,-50%) scale(0.3)', opacity: 0, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(150,205,255,0.5) 26%, rgba(40,120,255,0.12) 50%, transparent 70%)' }} />
        </div>

        <img ref={wordmarkRef} src="/boot/divad-wordmark.png" alt="DIVAD OS"
          style={{ width: 'clamp(230px,38vmin,560px)', height: 'auto', marginTop: '3.6vmin', opacity: 0, transform: 'translateY(16px)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1em', marginTop: '2.6vmin', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 'clamp(13px,2.5vmin,28px)', lineHeight: 1 }}>
          <span ref={w1Ref} style={{ opacity: 0, color: '#2f8dff', textShadow: '0 0 14px rgba(47,141,255,0.5)' }}>Navigate.</span>
          <span ref={w2Ref} style={{ opacity: 0, color: '#eaf0f8', textShadow: '0 0 12px rgba(210,225,245,0.36)', fontWeight: 700 }}>Engineer.</span>
          <span ref={w3Ref} style={{ opacity: 0, color: '#2f8dff', textShadow: '0 0 14px rgba(47,141,255,0.5)' }}>Excel.</span>
        </div>

        {showEnter && (
          <button onClick={onEnter}
            style={{ marginTop: '4vmin', padding: '12px 40px', background: 'rgba(12,22,40,0.6)', border: '1px solid rgba(90,150,230,0.5)', borderRadius: 999, color: '#9fc2f2', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', animation: 'fadeInUp 0.5s ease forwards' }}>
            ENTER
          </button>
        )}
      </div>

      <button onClick={() => play()}
        style={{ position: 'absolute', right: 18, bottom: 16, display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'rgba(12,22,40,0.5)', border: '1px solid rgba(90,150,230,0.32)', borderRadius: 999, color: '#9fc2f2', fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12, cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
        <span style={{ fontSize: 14 }}>↻</span> Replay
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
