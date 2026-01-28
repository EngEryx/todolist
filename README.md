# void

Minimalist task management. PIN protected, offline-first, real-time P2P sync.

**Live:** https://todolist-delta-ruddy.vercel.app

## Features

- **PIN Protection** - 4-digit PIN with SHA-256 hashing secures access
- **Offline First** - All data stored in localStorage, no backend required
- **P2P Real-time Sync** - Share lists via WebRTC, direct browser-to-browser connection
- **Zero Tracking** - No accounts, no cloud, your data never touches a server
- **Theme Toggle** - Light and dark modes
- **Responsive** - Works on mobile and desktop

## P2P Sharing

Share your todo list in real-time with another device:

1. Click the share icon in the header
2. Create a room to get a 6-character code
3. Share the code with your peer
4. They join using the code
5. Changes sync instantly between both devices

All data transfers directly between browsers using WebRTC. No server stores your todos.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Storage | localStorage |
| Real-time | PeerJS (WebRTC) |
| Deployment | Vercel |

## Project Structure

```
src/
  app/
    page.tsx          Landing page
    app/page.tsx      Main todo app (PIN gated)
  components/
    Landing.tsx       Hero and feature highlights
    PinGate.tsx       PIN setup and verification
    TodoList.tsx      Task management interface
    ThemeToggle.tsx   Light/dark theme switcher
    P2PShare.tsx      WebRTC sharing modal
  lib/
    storage.ts        localStorage helpers
    pin.ts            PIN hashing and validation
    peer.ts           WebRTC P2P sync logic
```

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Deployment

Deployed automatically via Vercel on push to main.

Manual deploy:
```bash
npx vercel --prod
```

## Roadmap

| Feature | Description | Status |
|---------|-------------|--------|
| P2P Sync | Real-time sharing via WebRTC | Done |
| Comments | Add comments to individual todos | Planned |
| Chat | Real-time chat per shared list | Planned |
| Presence | See who is online viewing the list | Planned |

## License

MIT
