# Netlify Deployment Guide

This document explains how to deploy the Forever Message client to Netlify with full Next.js support including API routes.

## Overview

This Next.js application includes:
- **Client-side UI**: React with Konva canvas for ocean visualization
- **Server-side API routes**: 5 API endpoints that handle blockchain transactions, IPFS uploads, and database operations
- **Private keys**: Secure server-side storage for blockchain signing

Netlify supports the full Next.js runtime including API routes via Netlify Functions.

## Prerequisites

- GitHub repository: https://github.com/loscolmebrothers/forever-message-client
- Netlify account (free tier works perfectly)
- Environment variables from your `.env.example` file

## Deployment Steps

### 1. Connect Repository to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select the repository: **loscolmebrothers/forever-message-client**
6. Configure build settings (should auto-detect):
   - **Build command**: `yarn build`
   - **Publish directory**: `.next`
   - **Branch to deploy**: `main`

### 2. Configure Environment Variables

**CRITICAL**: You must add ALL environment variables before the first deployment, including private keys.

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add the following:

#### Public Variables (exposed to browser)

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_IPFS_GATEWAY` | IPFS gateway URL | `https://ipfs.io/ipfs/` |

#### Private Variables (server-side only)

| Variable Name | Description | Security Level |
|--------------|-------------|----------------|
| `DEPLOYER_PRIVATE_KEY` | Private key for signing blockchain transactions | **🔒 CRITICAL - Never commit** |
| `BASE_SEPOLIA_RPC_URL` | Alchemy/Infura RPC URL for Base Sepolia | **🔒 Contains API key** |
| `CONTRACT_ADDRESS` | Smart contract address on Base Sepolia | Public but needed server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key for server operations | **🔒 CRITICAL - Never expose** |

**Where to find these values:**
- Check your `.env.example` file for the format
- Supabase keys: Supabase Dashboard → Project Settings → API
- Private key: Your wallet's private key (ensure it has testnet ETH)
- RPC URL: Alchemy or Infura dashboard
- Contract address: From your smart contract deployment

### 3. Deploy

Once environment variables are configured:

1. Click **"Deploy site"** (or it may auto-deploy)
2. Netlify will:
   - Clone your repository
   - Install dependencies (`yarn install`)
   - Build your Next.js app (`yarn build`)
   - Deploy both static assets and API routes as Netlify Functions
3. Monitor the deploy log for any errors
4. Once complete, your site will be live at: `https://[random-name].netlify.app`

### 4. Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to set up DNS

### 5. Enable Continuous Deployment

**Already enabled by default!** Every push to the `main` branch will automatically trigger a new deployment.

To deploy from other branches:
1. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
2. Add additional branches under **"Deploy contexts"**

## Local Testing

Test the production build locally before deploying:

```bash
# Install dependencies
yarn install

# Create .env.local file with your environment variables
cp .env.example .env.local
# Edit .env.local with real values

# Build the Next.js app
yarn build

# Start production server
yarn start
```

Visit `http://localhost:3000` to test all features including API routes.

## Configuration Files

### `netlify.toml`
- Build command and publish directory
- Next.js plugin configuration
- Security headers
- Redirect rules

### `next.config.js`
- React Strict Mode enabled
- Webpack configuration for Konva compatibility
- **No static export** - full Next.js features enabled

### API Routes Architecture

All API routes run as Netlify Functions (serverless):

| Route | File | Purpose |
|-------|------|---------|
| `/api/auth/wallet` | `app/api/auth/wallet/route.ts` | Returns custodial wallet info |
| `/api/bottles` | `app/api/bottles/route.ts` | Fetches bottles from blockchain |
| `/api/bottles/create` | `app/api/bottles/create/route.ts` | Creates new bottles (uses private key) |
| `/api/bottles/[id]/like` | `app/api/bottles/[id]/like/route.ts` | Toggles likes (uses private key) |
| `/api/bottles/[id]/comments` | `app/api/bottles/[id]/comments/route.ts` | Adds comments (uses private key) |

All routes use `runtime = "nodejs"` for ethers.js compatibility.

## Troubleshooting

### Deployment fails during build

**Check the deploy log for errors:**

```bash
# Common issues:
- Missing environment variables → Add all variables in Netlify dashboard
- Dependency installation fails → Check package.json for incompatible versions
- TypeScript errors → Run `yarn build` locally to catch errors before pushing
```

### API routes return 500 errors

**Most common causes:**

1. **Missing environment variables**
   - Go to Site settings → Environment variables
   - Verify ALL variables are set (including private keys)
   - Redeploy after adding variables

2. **Private key format issues**
   - Ensure `DEPLOYER_PRIVATE_KEY` starts with `0x`
   - No quotes or extra whitespace
   - Has sufficient testnet ETH for transactions

3. **RPC URL issues**
   - Verify `BASE_SEPOLIA_RPC_URL` is correct
   - Check Alchemy/Infura dashboard for rate limits
   - Ensure API key is active

### Environment variables not working

- **Public variables** (`NEXT_PUBLIC_*`): Must start with `NEXT_PUBLIC_` prefix
- **Private variables**: Never accessed from client-side code
- After adding/changing variables: **Trigger a new deployment** (changes don't auto-deploy)

### Function timeout errors

- Netlify free tier: 10-second timeout for functions
- If blockchain transactions take too long:
  - Check RPC provider response time
  - Consider upgrading to Pro plan (26-second timeout)

### CORS errors

If you see CORS errors when calling API routes:
- Ensure you're calling routes from the same domain
- Check that routes return proper CORS headers (if calling from external domains)

### Images not loading

- No special configuration needed for Netlify
- Next.js Image Optimization works out of the box
- Images in `public/` directory are automatically served

## Security Best Practices

### ✅ DO:
- Keep `DEPLOYER_PRIVATE_KEY` in Netlify environment variables only
- Never commit `.env.local` or `.env` files
- Use `.env.example` for documentation only (no real values)
- Rotate private keys if accidentally exposed
- Monitor Supabase and blockchain for unusual activity

### ❌ DON'T:
- Never log private keys in API routes
- Don't expose server-side variables to client code
- Don't commit real values to Git
- Don't share environment variables in public channels

## Monitoring

### View Function Logs

1. Go to your Netlify site dashboard
2. Click **"Functions"** tab
3. Click on any function to see invocation logs
4. Check for errors, performance issues, or unusual activity

### Analytics

1. Enable Netlify Analytics (paid feature) for detailed traffic stats
2. Or use free alternatives:
   - Google Analytics
   - Plausible Analytics
   - Umami

## Useful Commands

```bash
# Trigger a new deployment from CLI
netlify deploy --prod

# View function logs
netlify functions:log

# Open Netlify dashboard
netlify open

# Run dev server locally
yarn dev
```

## Support

- **Netlify Docs**: https://docs.netlify.com/integrations/frameworks/next-js/
- **Next.js Docs**: https://nextjs.org/docs
- **Project Issues**: https://github.com/loscolmebrothers/forever-message-client/issues

## Notes

- First deployment takes ~2-5 minutes
- Subsequent deployments are faster (~1-2 minutes)
- Function cold starts may cause first request to be slower
- Free tier includes: 100GB bandwidth, 125k function invocations/month
- All API routes automatically become serverless functions
- No need to manage servers or infrastructure
