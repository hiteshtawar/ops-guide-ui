# Quick Start Guide

## Step 1: Start the Backend API Server

**Option A: Manual Start (Recommended)**
Open a terminal and run:

```bash
cd /Users/hiteshtawar/ops-guide-mvp
python3 server.py
```

Or use the helper script:
```bash
cd /Users/hiteshtawar/ops-guide-ui
./start-backend.sh
```

You should see:
```
🚀 OpsGuide MVP Server starting on port 8093
📍 Health check: http://localhost:8093/health
📍 API info: http://localhost:8093/
📍 Submit request: POST http://localhost:8093/v1/request
```

**Keep this terminal open** - the server needs to keep running.

**Option B: Combined Start (Background)**
From the UI directory:
```bash
cd /Users/hiteshtawar/ops-guide-ui
./start.sh
```
This starts both backend and frontend together.

## Step 2: Start the React UI

If you used Option A above, open a **new terminal** window/tab and run:

```bash
cd /Users/hiteshtawar/ops-guide-ui
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 3: Open the App in Browser

Click the link or manually open: **http://localhost:5173/**

## Step 4: Test the API

1. In the browser, you'll see the greeting and input box
2. Type: `cancel case CASE-2024-TEST-001`
3. Press **Enter** or click the **Send button** (arrow icon)
4. You should see:
   - Loading spinner
   - Response showing:
     - Classification (task_id: CANCEL_CASE)
     - Confidence score
     - Extracted entities (case_id: CASE-2024-TEST-001)
     - Next steps with runbook link

## Test Cases to Try

Try these different queries:

1. **Cancel Case**: `cancel case CASE-2024-TEST-001`
2. **Cancel Order**: `cancel order ORDER-2024-001`
3. **Change Status**: `change order status to completed for ORDER-456`

## Troubleshooting

### Backend not starting?
- Make sure Python 3.11+ is installed: `python3 --version`
- Install dependencies: `cd /Users/hiteshtawar/ops-guide-mvp && pip install -r requirements.txt`
- Check if port 8093 is already in use: `lsof -Pi :8093`

### UI shows connection error?
- **Most common issue**: Backend is not running
- Start the backend first (see Step 1)
- Verify backend is running: `curl http://localhost:8093/health`
- Check browser console for errors (F12)

### Port already in use?
```bash
# Kill process on port 8093 (if needed)
lsof -ti:8093 | xargs kill -9
```

### CORS errors?
- The backend should have CORS enabled (Access-Control-Allow-Origin: *)
- If you see CORS errors, make sure the backend is running

## Verify Backend is Running

Test the backend directly:
```bash
curl http://localhost:8093/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "opsguide-mvp",
  ...
}
```

## Stopping the Servers

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
- If using `start.sh`, pressing `Ctrl+C` will stop both
