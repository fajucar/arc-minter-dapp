# ArcMinter (Arc Testnet) — Frontend dApp

React + Vite frontend for minting / managing Gift Card NFTs on **Arc Testnet**.

## Quick start (local)

1) Install deps
```bash
npm install
```

2) Create your env file
```bash
cp .env.example .env
```
Edit `.env` with your deployed contract addresses.

3) Run
```bash
npm run dev
```

## Build
```bash
npm run build
```
Output goes to `dist/`.

## Vercel deploy

- **Framework**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`
- Add the same variables from `.env` inside **Vercel → Settings → Environment Variables**

## Network (Arc Testnet)
- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`

## Repo hygiene
- Secrets do **not** belong in git. Keep `.env` local and commit only `.env.example`.
- Extra docs/scripts are in `docs/` and `tools/windows/`.
