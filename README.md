# void

Minimalist task management. PIN protected, offline-first, zero tracking.

**Live:** https://todolist-delta-ruddy.vercel.app

## Features

- **PIN Protection** - 4-digit PIN with SHA-256 hashing secures access
- **Offline First** - All data stored in localStorage, no backend required
- **Zero Tracking** - No accounts, no cloud sync, no analytics
- **Minimalist Design** - Monochrome theme (black/white/gray)
- **Responsive** - Works on mobile and desktop

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Storage | localStorage |
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
  lib/
    storage.ts        localStorage helpers
    pin.ts            PIN hashing and validation
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

## License

MIT
