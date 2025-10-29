# OpsGuide UI - Quick Start for Demo

## Prerequisites
- Node.js 18+ installed (`node --version`)
- npm installed (comes with Node.js)
- Backend server running on `http://localhost:8093` (see `ops-guide-mvp` repo)

## Setup & Run (3 steps)

1. **Install dependencies** (one-time setup):
   ```bash
   npm install
   ```

2. **Start the UI**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - Look for the URL in terminal (usually `http://localhost:5173`)
   - Or manually open: `http://localhost:5173`

## What to Expect
- Beautiful peacock-themed UI
- Input box to type operational requests
- Real-time API responses with formatted results

## Try These Examples
1. `cancel case CASE-2024-TEST-001`
2. `cancel order ORDER-2024-001`
3. `change order status to completed for ORDER-456`

## Full Demo Flow

**Terminal 1 - Backend:**
```bash
cd ops-guide-mvp
./start-server.sh
```

**Terminal 2 - Frontend:**
```bash
cd ops-guide-ui
npm install  # first time only
npm run dev
```

**Browser:**
- Open `http://localhost:5173`
- Type a request and see the formatted response!

## Troubleshooting

**Backend not running?**
- Make sure backend is started first (see `ops-guide-mvp` repo)
- Check: `curl http://localhost:8093/health`

**Port conflicts?**
- Vite will automatically use next available port
- Backend must be on port 8093

**Dependencies issue?**
```bash
rm -rf node_modules package-lock.json
npm install
```

