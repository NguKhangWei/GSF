import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import newsletterImg from '../../brand_assets/background/cinematic golf.webp'
import { subscribeToNewsletter } from '../lib/newsletter'

/**
 * GSF newsletter popup — onyx & gold.
 *
 * Display rules (industry-standard, non-intrusive):
 *  - Shows once per visitor: after 15s dwell OR on exit-intent, whichever fires first.
 *  - Never interrupts conversion/auth flows (checkout, order-confirmation, login, register, account).
 *  - Dismissed → suppressed for 30 days. Subscribed → suppressed permanently.
 *  - Respects prefers-reduced-motion; closes on Esc / backdrop; locks body scroll while open.
 */

const STORAGE_KEY = 'gsf_newsletter'
const RESHOW_AFTER_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const DWELL_MS = 15_000
const SUPPRESSED_PATHS = ['/checkout', '/order-confirmation', '/login', '/register', '/account']

type Stored = { status: 'dismissed' | 'subscribed'; at: number }

function shouldSuppress(): boolean {
  if (SUPPRESSED_PATHS.some((p) => window.location.pathname.startsWith(p))) return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const s = JSON.parse(raw) as Stored
    if (s.status === 'subscribed') return true
    if (s.status === 'dismissed') return Date.now() - s.at < RESHOW_AFTER_MS
  } catch {
    /* corrupt entry — treat as never seen */
  }
  return false
}

export default function NewsletterModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const emailRef = useRef<HTMLInputElement>(null)

  // Arm the triggers (timer + exit-intent) once, if the visitor is eligible.
  useEffect(() => {
    if (shouldSuppress()) return

    let fired = false
    const reveal = () => {
      if (fired || shouldSuppress()) return
      fired = true
      setOpen(true)
      cleanup()
    }

    const timer = window.setTimeout(reveal, DWELL_MS)
    const onExit = (e: MouseEvent) => {
      if (e.clientY <= 0) reveal()
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      document.removeEventListener('mouseout', onExit)
    }
    document.addEventListener('mouseout', onExit)
    return cleanup
  }, [])

  // Focus, scroll-lock and Esc-to-close while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    emailRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function persist(status: Stored['status']) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }))
    } catch {
      /* private mode — best effort */
    }
  }

  function close() {
    if (status !== 'done') persist('dismissed')
    setOpen(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    const ok = await subscribeToNewsletter({ name, email, source: 'gsf' })
    if (ok) {
      persist('subscribed')
      setStatus('done')
    } else {
      setStatus('error')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gsf-nl-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-forest/80 backdrop-blur-sm motion-safe:animate-[fadeIn_240ms_ease-out]"
        onClick={close}
        aria-hidden="true"
      />

      {/* card */}
      <div className="relative grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-lg border border-gold/25 bg-forest-mid shadow-[0_30px_80px_-24px_rgba(0,0,0,0.85)] motion-safe:animate-[popIn_320ms_cubic-bezier(0.16,1,0.3,1)] md:grid-cols-2">
        {/* image panel */}
        <div className="relative hidden min-h-[260px] md:block">
          <img
            src={newsletterImg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-forest-mid/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 to-transparent" />
          <img
            src="/brand_assets/GSF LOGO ICON ONLY.avif"
            alt="Golf Smart Factory"
            className="absolute left-6 top-6 h-10 w-auto opacity-90"
          />
        </div>

        {/* form panel */}
        <div className="relative p-8 sm:p-10">
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-1.5 text-gsf-muted transition-colors hover:bg-forest-light hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {status === 'done' ? (
            <div className="flex min-h-[240px] flex-col justify-center text-center">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="font-display text-2xl font-medium text-cream">You're on the list</h2>
              <p className="mt-2 text-sm leading-relaxed text-gsf-muted">
                Thanks{name ? `, ${name.split(' ')[0]}` : ''}. Keep an eye on your inbox for the
                latest from Golf Smart Factory.
              </p>
              <button onClick={() => setOpen(false)} className="btn-primary mt-6 self-center">
                Continue browsing
              </button>
            </div>
          ) : (
            <>
              <p className="font-mono text-[0.68rem] uppercase tracking-widest2 text-gold">
                GSF · Newsletter
              </p>
              <h2 id="gsf-nl-title" className="mt-3 font-display text-[1.9rem] font-medium leading-tight text-cream">
                Get the Latest News to Your Inbox
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gsf-muted">
                Subscribe to our newsletter to receive news and updates.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name here"
                  aria-label="Your name"
                  className="w-full rounded-sm border border-forest-light bg-forest px-4 py-3 text-sm text-cream placeholder:text-gsf-muted focus:border-gold focus:outline-none"
                />
                <input
                  ref={emailRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email here .."
                  aria-label="Your email"
                  className="w-full rounded-sm border border-forest-light bg-forest px-4 py-3 text-sm text-cream placeholder:text-gsf-muted focus:border-gold focus:outline-none"
                />
                {status === 'error' && (
                  <p className="text-xs text-gold-ember">Something went wrong. Please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>

              <p className="mt-4 text-[0.7rem] leading-relaxed text-gsf-muted">
                No spam. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
