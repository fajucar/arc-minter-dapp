# Deployment Guide

## Quick Deploy Steps

### 1. Build the project
```bash
npm run build
```

This will:
- Type-check the TypeScript code (`tsc`)
- Build the production bundle (`vite build`)
- Output to `dist/` directory

### 2. Preview the build locally (optional)
```bash
npm run preview
```

### 3. Deploy the `dist/` folder

Deploy the `dist/` folder to your hosting service:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Configure build output to `dist/`
- **Any static host**: Upload contents of `dist/` folder

## Environment Variables

Ensure your `.env` file contains (at minimum):

```env
VITE_GIFT_CARD_NFT_ADDRESS=0x...
```

Optional (app works without these):
```env
VITE_ARC_COLLECTION_ADDRESS=0x... (fallback if VITE_GIFT_CARD_NFT_ADDRESS not set)
VITE_GIFT_CARD_MINTER_ADDRESS=0x... (optional - minting disabled if not set)
VITE_MOCK_USDC_ADDRESS=0x... (optional - not used)
```

## Current State

✅ **GM Flow**: Working end-to-end
- Simple on-chain transaction (self-tx with 0 value)
- Confetti animation on success
- Share modal with transaction hash

✅ **NFT Minting**: Intentionally disabled
- Shows "Mint Coming Soon" message
- Mint buttons disabled
- Metadata links working

✅ **Build**: Ready
- No hardcoded localhost URLs
- Uses `window.location.origin + BASE_URL` for metadata URLs
- Environment variables properly handled

## Verification Checklist

- [ ] Build succeeds: `npm run build`
- [ ] No console errors on page load
- [ ] GM button works and triggers confetti
- [ ] NFT section shows "Coming Soon"
- [ ] Metadata links are clickable
- [ ] Environment variables loaded correctly



