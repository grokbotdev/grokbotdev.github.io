# AE Officials Association — Post-Game Reporting

Invite-only portal for crew game reports, last-four review, and supervisor notes.

This is a hobby association app, not a revenue SaaS. The public brand is **AE Officials Association** only.

## Live demo (phone)

Public HTTPS URL (demo / localStorage mode — no Firebase secrets):

**https://web-production-5b4e3.up.railway.app/**

Password for every seeded account: `DemoPass123!`

| Name | Role | Email |
| --- | --- | --- |
| Alex Rivera | Official | `alex.rivera@demo.ae-officials.local` |
| Taylor Brooks | Supervisor | `taylor.brooks@demo.ae-officials.local` |
| Riley Quinn | Admin | `riley.quinn@demo.ae-officials.local` |

Hosted on Railway as a static Vite build (`dist/`) with SPA fallback. Firebase env vars are left unset so the public site stays in demo mode.

## How to run (local demo)

The app starts in **local demo mode** when Firebase env vars are absent. No cloud project is required.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (demo mode by default) |
| `npm test` | Unit tests for submit rules and role gates |
| `npm run build` | Production static build → `dist/` |
| `npm run preview` | Serve the production build locally |

Reset seeded games and playlists from the footer (“Reset demo data”) while signed in.

## Demo logins (replace later)

There is **no public sign-up**. These accounts exist only in demo mode. Password for every seeded user:

`DemoPass123!`

| Name | Role | Email |
| --- | --- | --- |
| Alex Rivera | Official | `alex.rivera@demo.ae-officials.local` |
| Jordan Lee | Official | `jordan.lee@demo.ae-officials.local` |
| Sam Patel | Official | `sam.patel@demo.ae-officials.local` |
| Casey Morgan | Official | `casey.morgan@demo.ae-officials.local` |
| Taylor Brooks | Supervisor | `taylor.brooks@demo.ae-officials.local` |
| Riley Quinn | Admin | `riley.quinn@demo.ae-officials.local` |

Seeded sample data:

- **Submitted** close game: Oakmont at Northridge (Alex / Jordan / Sam) with 4-minute lines and supervisor comments
- **Draft** blowout: Cedar Ridge at Westhill (Casey / Alex / Jordan), videos incomplete
- Admin playlist stub: “Restricted-area block/charge”

## What this scaffold covers

**Roles**

- Official: own/crew games only. Create → submit. No global video library.
- Supervisor: all games. Comments on videos and 4-minute lines. Game admin notes. Reports stub. Same video-library browse/filter as Admin. **Cannot** manage playlists.
- Admin: view all games, library, and playlists. **Cannot** post supervisor-style comments.

**Game workflow**

1. Sign in → **New game** → choose collaborating officials (R / U1 / U2, optional Alternate; Alternate may be typed if not in the list).
2. Date, home, visitor, scores, overtime toggle.
3. Exactly four videos (≤100 MB each), each with description + play type. Upload UI is large-target / phone-friendly. Storage is stubbed in demo mode (file metadata persisted; binary preview is session-only).
4. If overtime **or** `|home − visitor| ≤ 6`, at least one complete **4-Minute Report** line is required to submit.
5. **Draft → Submitted**. Submit locks the crew. After submit, only a supervisor may edit.

**4-Minute line fields:** half (1st / 2nd / OT), game clock (`M:SS`, decimal allowed under 1:00), **positions** (multi-select chips: Lead / Center / Trail), **officials** (multi-select chips from the crew), decision (CC / IC / NCC / NCI / INC), play type, explanation, optional link to one of the four game videos. Completing the fields does **not** add a line — tap **Add**. After Add, half and clock carry forward; the rest clears for the next entry.

**Video library (admin + supervisor):** first-class clip fields `playType`, `description`, `homeTeam`, `visitorTeam`. Filter/search by play type, home or visitor team, and text on descriptions/filenames. Opening a clip plays it in a lightbox; it does not deep-link into the game report. Playlist navigation uses the same in-player Previous / Next. Playlists remain admin-only.

**Video play types:** Block/Charge, Foul (personal), Foul (technical), Travel, Double dribble, Out of bounds, Goaltending/BI, Shot clock, Other.

**4-minute play types:** Block/Charge, Foul, Travel, OOB, Coverage/positioning, Other.

**URLs (after sign-in)**

| Path | Who |
| --- | --- |
| `/login` | Everyone (no sign-up) |
| `/` | Officials: my games. Supervisor: all games. Admin: all games (view) |
| `/games/new` | Officials |
| `/games/:gameId` | Crew + supervisor + admin |
| `/reports` | Supervisor |
| `/library` | Admin + Supervisor |
| `/playlists` | Admin |

## Stack choice

**Vite + React + TypeScript** as a static SPA. `npm run build` writes `dist/`, which [Firebase Hosting](https://firebase.google.com/docs/hosting) can serve with a single SPA rewrite (`firebase.json`). That keeps Hosting for the *app shell only*.

**Videos are never served through Firebase Hosting transfer.** Upload targets Storage / GCS / R2; playback should use those object URLs or a CDN (`VITE_VIDEO_CDN_BASE_URL`). Transcode is a placeholder that prefers [Coconut](https://www.coconut.co/) via Cloud Functions (`functions/src/processVideo.js`).

Firestore + Auth are the intended production backend (email/password, invite-only). This repo does **not** claim a production Firebase project is configured.

## Environment variables

Copy `.env.example` to `.env.local`. Leave the Firebase keys blank to stay in demo mode.

| Variable | Required? | Notes |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Production only | If missing (with project id), the UI stays in demo mode |
| `VITE_FIREBASE_AUTH_DOMAIN` | Production only | |
| `VITE_FIREBASE_PROJECT_ID` | Production only | Also put this in `.firebaserc` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Production only | Game video bucket — not Hosting |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Production only | |
| `VITE_FIREBASE_APP_ID` | Production only | |
| `VITE_USE_FIREBASE_EMULATORS` | Optional | `true` to talk to local emulators instead of localStorage demo |
| `VITE_FIREBASE_EMULATOR_HOST` | Optional | Defaults to `127.0.0.1` |
| `VITE_VIDEO_CDN_BASE_URL` | Optional | Public playback origin after transcode |
| `COCONUT_API_KEY` | Functions only | Not used until the placeholder job is wired |
| `COCONUT_WEBHOOK_SECRET` | Functions only | |

## Firebase project setup (placeholders)

Production is **not** wired. When you are ready:

1. Create a Firebase project (Auth, Firestore, Storage, Hosting, Functions).
2. Enable **Email/Password** only. Do not enable public registration in the app — provision users with the Admin SDK or Firebase console (invite-only).
3. Replace `YOUR_FIREBASE_PROJECT_ID` in `.firebaserc`.
4. Fill `.env.local` from the Firebase web app config.
5. Deploy rules: `firestore.rules`, `storage.rules` (100 MB video cap, `video/*`).
6. Hosting: `npm run build && firebase deploy --only hosting` (serves `dist/`).
7. Point Storage uploads at `games/{gameId}/videos/...`. Wire `functions/src/processVideo.js` to Coconut; store playback URLs on the game document.

Local emulators (optional, still not a production project):

```bash
npm i -g firebase-tools
firebase emulators:start
```

Set `VITE_USE_FIREBASE_EMULATORS=true` **and** provide a Firebase web config (can be the emulator project’s dummy keys). Without those keys the UI remains in the localStorage demo.

## Data model (demo / intended Firestore)

- `users/{uid}` — `name`, `email`, `role` (`official` \| `supervisor` \| `admin`)
- `games/{id}` — status, scoreline, crew, four videos, 4-minute lines (`positions[]`, `officialIds[]`), admin notes, supervisor comments
- `library` views flatten videos with `playType`, `description`, `homeTeam`, `visitorTeam` for filter/search
- `playlists/{id}` — admin teaching lists of `{ gameId, videoId }`

Demo persistence is `localStorage` key `aeoa-pgr-demo-v2` (video bytes are not stored).
