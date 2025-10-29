# 🦚 OpsGuide - Operational Intelligence Platform

**Quick Demo Guide for Managers**

## What Is This?

An intelligent operational assistant that converts natural language requests into actionable procedures using pattern recognition and API integration.

## Demo Setup (5 Minutes)

### Step 1: Backend Server
```bash
cd ops-guide-mvp
./start-server.sh
```
✅ Server runs on `http://localhost:8093`

### Step 2: Frontend UI
```bash
cd ops-guide-ui
npm install  # first time only
npm run dev
```
✅ UI opens at `http://localhost:5173`

### Step 3: Try It Out
Open browser → `http://localhost:5173` → Type:
- `cancel case CASE-2024-TEST-001`
- `cancel order ORDER-2024-001`

## Key Features Shown

1. **Natural Language Processing**: Type requests in plain English
2. **Pattern Recognition**: Identifies task types (CANCEL_CASE, CANCEL_ORDER, etc.)
3. **Entity Extraction**: Pulls out IDs, services, and context
4. **Structured Response**: Beautiful formatted output with next steps
5. **Modern UI**: Clean, responsive peacock-themed interface

## Technology Stack

- **Backend**: Python 3.11+, Pydantic, HTTP server
- **Frontend**: React 19, TypeScript, Vite
- **Architecture**: Pattern matching → Classification → Response

## Project Structure

```
ops-guide-mvp/          # Backend API server
  ├── server.py         # Main server
  ├── start-server.sh   # Start script
  └── knowledge/        # Runbooks & API specs

ops-guide-ui/           # React UI
  ├── src/
  │   ├── App.tsx       # Main component
  │   └── App.css       # Styles
  └── package.json      # Dependencies
```

## Questions?

- See `SETUP_GUIDE.md` in each repo for detailed instructions
- All scripts are executable and self-contained
- Virtual environments and dependencies are auto-handled

