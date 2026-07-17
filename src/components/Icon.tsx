import type { ReactNode } from 'react'
import type { AmbienceLayerId } from '../types'

/**
 * Minimal line icons for the ambience layers, drawn on a shared 24×24 grid
 * with a consistent 1.6 stroke so they read as one set — quiet and
 * handmade, matching the room's art rather than shouting like emoji.
 */

const paths: Record<AmbienceLayerId, ReactNode> = {
  lofi: (
    <>
      <circle cx="8" cy="17" r="2.4" />
      <circle cx="17" cy="15" r="2.4" />
      <path d="M10.4 17V7l8.6-2v10" />
    </>
  ),
  rain: (
    <>
      <path d="M7 14a4 4 0 0 1 .3-8 5 5 0 0 1 9.5 1.2A3.4 3.4 0 0 1 16.5 14H7z" />
      <path d="M8 17.5l-1 2M12 17.5l-1 2M16 17.5l-1 2" />
    </>
  ),
  fire: (
    <path d="M12 3.5c2.5 3 4.5 4.8 4.5 8a4.5 4.5 0 1 1-9 0c0-1.6.8-2.9 1.8-3.8.2 1.1.9 1.7 1.6 1.8-.6-2.2.3-4.6 1.1-5.8z" />
  ),
  typing: (
    <>
      <rect x="3.5" y="7.5" width="17" height="9" rx="1.6" />
      <path d="M7 10.5h.01M10 10.5h.01M13 10.5h.01M16 10.5h.01M8.5 13.5h7" />
    </>
  ),
  crickets: <path d="M18 13.5A6.5 6.5 0 1 1 10.5 6a5 5 0 0 0 7.5 7.5z" />,
  birds: (
    <>
      <path d="M4 9c1.2-1.6 2.6-1.6 3.8 0 1.2-1.6 2.6-1.6 3.8 0" />
      <path d="M12.4 13c1.2-1.6 2.6-1.6 3.8 0 1.2-1.6 2.6-1.6 3.8 0" />
    </>
  ),
  waves: (
    <>
      <path d="M3.5 10c1.5-1.8 3-1.8 4.5 0s3 1.8 4.5 0 3-1.8 4.5 0 3 1.8 3.5 0" />
      <path d="M3.5 15c1.5-1.8 3-1.8 4.5 0s3 1.8 4.5 0 3-1.8 4.5 0 3 1.8 3.5 0" />
    </>
  ),
  stream: (
    <>
      <path d="M9 4c-1.6 2 1 3.4 0 5.4S8 13 9 15s-1 3.4 0 5" />
      <path d="M15 4c-1.6 2 1 3.4 0 5.4S14 13 15 15s-1 3.4 0 5" />
    </>
  ),
  thunder: (
    <>
      <path d="M7 12.5a4 4 0 0 1 .3-8 5 5 0 0 1 9.5 1.2A3.4 3.4 0 0 1 16.5 12.5H7z" />
      <path d="M12 12l-2.2 3.6H12L10.5 19" />
    </>
  ),
  wind: (
    <>
      <path d="M3.5 9h9a2.4 2.4 0 1 0-2.4-2.4" />
      <path d="M3.5 13h12a2.6 2.6 0 1 1-2.6 2.6" />
    </>
  ),
}

export function LayerIcon({ id, className }: { id: AmbienceLayerId; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[id]}
    </svg>
  )
}

/** A small chevron that rotates via CSS when its drawer is open. */
export function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
