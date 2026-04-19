const FIREBASE_STORAGE_HOSTS = ['firebasestorage.googleapis.com', 'firebasestorage.app']
const GOOGLE_USER_CONTENT_HOSTS = ['lh3.googleusercontent.com', 'lh4.googleusercontent.com', 'lh5.googleusercontent.com', 'lh6.googleusercontent.com']
const ALLOWED_HOSTS = new Set<string>([...FIREBASE_STORAGE_HOSTS, ...GOOGLE_USER_CONTENT_HOSTS])

export function isSafeImageUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string' || raw.length === 0) return false
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  return [...ALLOWED_HOSTS].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
}

export function safeImageUrl(raw: unknown): string | null {
  return isSafeImageUrl(raw) ? raw : null
}
