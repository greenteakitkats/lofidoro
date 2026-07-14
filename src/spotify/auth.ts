import { SPOTIFY_CLIENT_ID, SPOTIFY_SCOPES, STORAGE_KEYS } from '../config'
import { generateCodeChallenge, generateCodeVerifier } from './pkce'

/**
 * Client-side Spotify Authorization Code + PKCE flow. No backend, no client
 * secret — the client ID is public by design in this flow. Tokens live in
 * localStorage; the code verifier lives in sessionStorage just long enough
 * to survive the redirect round-trip.
 */

const VERIFIER_KEY = 'lofidoro:spotify_verifier'
const AUTH_URL = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'

export interface Tokens {
  accessToken: string
  refreshToken: string
  expiresAt: number // epoch ms
}

function redirectUri(): string {
  // must exactly match a URI registered in the Spotify dashboard, trailing slash included
  return `${window.location.origin}${window.location.pathname}`
}

export function loadTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.spotifyTokens)
    return raw ? (JSON.parse(raw) as Tokens) : null
  } catch {
    return null
  }
}

function saveTokens(tokens: Tokens): void {
  localStorage.setItem(STORAGE_KEYS.spotifyTokens, JSON.stringify(tokens))
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.spotifyTokens)
}

/** Kick off the PKCE flow — redirects the browser to Spotify. */
export async function beginLogin(): Promise<void> {
  const verifier = generateCodeVerifier()
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  const challenge = await generateCodeChallenge(verifier)

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })
  window.location.assign(`${AUTH_URL}?${params.toString()}`)
}

/** Call once on app load. If the URL carries `?code=`, completes the flow and cleans the URL. */
export async function handleRedirect(): Promise<void> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (!code) return

  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)
  window.history.replaceState({}, '', window.location.pathname)
  if (!verifier) return

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: verifier,
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) return
  const json = await res.json()
  saveTokens({
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  })
}

async function refresh(tokens: Tokens): Promise<Tokens | null> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokens.refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    clearTokens()
    return null
  }
  const json = await res.json()
  const next: Tokens = {
    accessToken: json.access_token,
    // PKCE refresh returns a new refresh token — must persist it
    refreshToken: json.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + json.expires_in * 1000,
  }
  saveTokens(next)
  return next
}

/** Returns a valid access token, refreshing if needed. Null if not logged in / refresh failed. */
export async function getAccessToken(): Promise<string | null> {
  let tokens = loadTokens()
  if (!tokens) return null
  if (tokens.expiresAt - 60_000 < Date.now()) {
    tokens = await refresh(tokens)
  }
  return tokens?.accessToken ?? null
}

export function isLoggedIn(): boolean {
  return loadTokens() !== null
}

export function logout(): void {
  clearTokens()
}
