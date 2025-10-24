# Forever Message - Client

> **Phase 1: The Floating Ocean** - Interactive canvas-based frontend for the Forever Message platform

## Overview

A Next.js 14 + react-konva application that displays messages in bottles floating in a digital ocean. Users can click bottles to read messages stored on the Base blockchain and IPFS.

## Tech Stack

- **Next.js 14** - App Router
- **TypeScript** - Type safety
- **react-konva** - Canvas rendering
- **@react-spring/konva** - Physics-based animations
- **@loscolmebrothers/forever-message-types** - Shared types from monorepo

## Project Structure

```
forever-message-client/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main ocean view
│   ├── globals.css        # Global styles
│   └── api/               # Future API routes
├── components/
│   ├── Ocean/             # Konva components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and constants
├── types/                 # TypeScript type definitions
└── public/
    └── assets/            # Images, sprites, etc.
```

## Getting Started

### Installation

```bash
yarn install
```

### Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
yarn build
yarn start
```

## Current Status

### ✅ Step 1: Project Setup (COMPLETED)
- [x] Next.js 14 initialized with TypeScript
- [x] Dependencies installed (react-konva, @react-spring/konva)
- [x] Folder structure created
- [x] TypeScript configured with path aliases
- [x] Dev server verified working

### ⏳ Next Steps (Phase 1)
- [ ] Step 2: Create Konva Stage and Ocean Background
- [ ] Step 3: Add Mock Data for Bottles
- [ ] Step 4: Implement Floating Bottle Components
- [ ] Step 5: Add Message Modal
- [ ] Step 6: Polish & Testing

## Development Guidelines

### Component Patterns

All Konva components must use the `'use client'` directive:

```tsx
'use client'

import { Stage, Layer } from 'react-konva'

export default function OceanStage() {
  // Canvas components need browser APIs
}
```

### Type Safety

Import shared types from the monorepo:

```tsx
import type { Bottle } from '@/types'
// or
import type { Bottle } from '@loscolmebrothers/forever-message-types'
```

### Animation Performance

- Use `@react-spring/konva` for smooth physics
- Cache static layers when possible
- Limit re-renders with proper memoization

## Phase 1 Goals

Create a peaceful, interactive ocean where:
- 5-10 bottles float with autonomous movement
- Bottles drift horizontally and bob vertically
- Clicking a bottle opens a modal with its message
- Design is responsive (desktop + mobile)
- Aesthetic is Studio Ghibli meets MapleStory

## Future Phases

- **Phase 2**: Real blockchain/IPFS data integration
- **Phase 3**: User authentication (Magic Link + Web3)
- **Phase 4**: Bottle creation UI
- **Phase 5**: Likes, comments, forever status
- **Phase 6**: Supabase caching layer
- **Phase 7**: Advanced polish (custom sprites, sound)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [react-konva Documentation](https://konvajs.org/docs/react/)
- [React Spring Documentation](https://www.react-spring.dev/)
- [PLANNING.md](../PLANNING.md) - Full project plan

---

**Status**: Step 1 Complete ✅  
**Last Updated**: October 24, 2025
