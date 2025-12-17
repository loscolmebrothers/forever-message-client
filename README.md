# Forever Message - Client

**Decentralized message-in-a-bottle application** built on Base blockchain with IPFS storage.

## Overview

Forever Message is a Next.js 14 application that combines blockchain technology, IPFS storage, and modern web3 tools to create an immersive experience where users can cast messages into a shared digital ocean.

### Key Features

- **Interactive Ocean Canvas**: 2D bottle visualization with Konva
- **Web3 Authentication**: Sign-in with Ethereum (SIWE) via Reown AppKit
- **Decentralized Storage**: Messages stored on IPFS (Storacha)
- **Blockchain Immutability**: Bottles minted as NFTs on Base Sepolia
- **Real-time Updates**: Queue-based async processing with live notifications
- **Professional Animations**: anime.js timeline orchestration
- **Glass-morphism UI**: Modern ocean-themed design system

### Tech Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Konva (2D canvas)
- Reown AppKit + wagmi + viem
- Supabase (PostgreSQL + Real-time)
- Storacha (IPFS)
- Tailwind CSS + anime.js

## Quick Start

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env.local

# Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

For complete documentation including architecture, data flows, tech stack details, and development guides, see:

**[forever-message-docs](../forever-message-docs/)**

- [Getting Started Guide](../forever-message-docs/getting-started.md)
- [Architecture Overview](../forever-message-docs/architecture/overview.md)
- [Data Flow Diagrams](../forever-message-docs/architecture/data-flow.md)
- [Tech Stack Details](../forever-message-docs/architecture/tech-stack.md)

## Testing

```bash
yarn test              # Unit tests (Jest)
yarn test:e2e          # E2E tests (Cypress)
yarn ci                # Full CI pipeline
```

See [TESTING.md](./TESTING.md) for details.

## Deployment

Deployed on Netlify with automatic deployments from `main` branch.

Environment variables are configured in the Netlify dashboard. See the [Getting Started Guide](../forever-message-docs/getting-started.md#environment-variables) for required variables.

## License

See [LICENSE](./LICENSE)
