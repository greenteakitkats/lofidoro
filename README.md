# lofidoro

A cozy little pomodoro timer that lives in an illustrated room. Focus and
the lamp glows warm; take a break and the cat curls up for a nap. Mix in
rain, fireplace, café, or cricket ambience, or connect Spotify to bring
your own music — the room reacts to real time of day, too.

Live at **https://greenteakitkats.github.io/lofidoro/**

## Features

- Pomodoro timer with Classic/Deep work/Quick presets, or fully custom
  interval lengths — drift-free even if you background the tab through a
  whole session.
- A living SVG room: lamp, candle, and cat react to focus/break/idle;
  the window sky follows the real time of day.
- Ambient sound mixer — rain, fireplace, café murmur, night crickets —
  synthesized entirely in the browser (no audio files, no licensing).
- Spotify: connect your account, browse curated lo-fi playlists or your
  own, and control playback. Auto-pause or duck the music on breaks.
- Everything (settings, mix, last playlist) is saved locally. No
  accounts, no backend, no tracking.

## Spotify setup

Spotify integration needs an app registered at
[developer.spotify.com](https://developer.spotify.com/dashboard):

1. Create an app, note the **Client ID**.
2. Add redirect URIs for both environments — exact match, trailing slash
   included:
   - `https://greenteakitkats.github.io/lofidoro/`
   - `http://127.0.0.1:5173/` (Spotify rejects plain `localhost`)
3. Paste the client ID into `src/config.ts` (`SPOTIFY_CLIENT_ID`), and
   add a few playlist IDs to `CURATED_PLAYLIST_IDS` if you want curated
   picks.
4. **Spotify apps in development mode allow up to 25 users.** Add each
   listener's Spotify account email under the app's dashboard → Users
   and Access. This is a Spotify platform limit, not something the app
   works around — fine for personal or friends-and-family use, not for
   a public launch without Spotify's extended-quota review.

In-browser playback (the Web Playback SDK) requires **Spotify Premium**
and isn't supported on iOS browsers. Everyone else — free accounts and
iOS — gets a remote-control mode instead: it controls playback on
whatever device already has Spotify open (phone, desktop app), with a
banner explaining that when no device is active.

The app is fully usable without ever connecting Spotify.

## Renaming

The name "lofidoro" appears in a few places if you want to change it:
`package.json` (`name`), `vite.config.ts` (`base`), `index.html`
(`<title>`, favicon path), and the Spotify redirect URIs above (update
both the dashboard and `src/config.ts` together, or auth breaks).

## Development

```bash
npm install
npm run dev      # serves on 127.0.0.1:5173 (Spotify needs this, not localhost)
npm test         # timer engine unit tests
npm run build    # typecheck + production build
```

Deploys automatically to GitHub Pages on push to `main`
(`.github/workflows/deploy.yml`).
