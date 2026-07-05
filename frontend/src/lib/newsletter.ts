// Newsletter signup transport.
//
// Backend removed for this deployment — signups are kept in localStorage as a
// client-side backup only (a later sync job can flush them once a backend
// exists). The popup always resolves to a success state.

const PENDING_KEY = 'gsf_newsletter_pending'

export type NewsletterSignup = {
  name: string
  email: string
  /** Which storefront the signup came from (drives list segmentation). */
  source: 'gsf' | 'kaen' | 'kuro'
}

function stashPending(payload: NewsletterSignup) {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    const list = raw ? (JSON.parse(raw) as NewsletterSignup[]) : []
    list.push(payload)
    localStorage.setItem(PENDING_KEY, JSON.stringify(list))
  } catch {
    /* private mode — best effort */
  }
}

export async function subscribeToNewsletter(payload: NewsletterSignup): Promise<boolean> {
  if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) return false

  stashPending(payload)
  return true
}
