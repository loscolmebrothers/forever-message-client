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

### ✅ Phase 1 MVP - COMPLETE!

All steps completed:

- [x] **Step 1**: Project Setup
  - Next.js 14 initialized with TypeScript
  - Dependencies installed (react-konva, @react-spring/konva, usehooks-ts)
  - Folder structure created
  - TypeScript configured with path aliases

- [x] **Step 2**: Konva Stage Setup
  - Full-screen ocean canvas with gradient background
  - Responsive window sizing
  - Layer-based architecture for performance

- [x] **Step 3**: Mock Data & Constants
  - 10 mock bottles with varied engagement data
  - Constants for physics, colors, and visuals
  - Helper functions for random positioning

- [x] **Step 4**: Floating Bottle Component
  - Physics-based horizontal drift with boundary detection
  - Vertical bobbing using sine wave animations
  - Subtle rotation based on direction
  - Visual distinction for "forever" bottles (golden color)
  - Click handling for bottle selection

- [x] **Step 5**: Message Modal
  - Beautiful modal overlay with backdrop
  - Displays message content and metadata
  - Shows engagement stats (likes, comments)
  - Expiration countdown with visual warnings
  - Escape key and click-outside-to-close functionality
  - Smooth enter/exit animations

- [x] **Testing**: Build successful, dev server running on http://localhost:3000

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

## What You Can Do Now

1. **View the Ocean**: Open http://localhost:3000 and see 10 bottles floating
2. **Click Any Bottle**: Opens a modal with the message and metadata
3. **Watch Them Float**: Each bottle has autonomous drift and bobbing physics
4. **Spot the Forever Bottle**: Look for the golden bottle (Bottle #6) that achieved forever status

## Known Limitations (Phase 1)

- Mock data only (no real blockchain/IPFS integration yet)
- No user authentication
- No ability to create bottles
- No like/comment functionality
- Simple geometric shapes (custom sprites coming in Phase 7)

---

**Status**: Phase 1 MVP Complete ✅  
**Last Updated**: October 26, 2025
