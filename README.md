# OpsGuide UI

A clean, Claude-inspired React TypeScript UI for the OpsGuide operational intelligence platform.

## 🚀 Quick Start (For Demo)

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for detailed instructions.

**Quick version:**
```bash
npm install
npm run dev
```
Open `http://localhost:5173` (make sure backend is running first!)

## Features

- 🎨 Clean, minimalist design inspired by Claude
- ⏰ Time-based greetings (Good morning/afternoon/evening/night)
- 📱 Fully responsive and adaptive to all screen sizes
- ⚡ Real-time API integration with the OpsGuide backend
- 📋 Structured response display with classification results

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpsGuide backend running on `http://localhost:8093`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Start the OpsGuide backend server:
   ```bash
   cd /path/to/ops-guide-mvp
   python server.py
   ```

2. Start this UI:
   ```bash
   npm run dev
   ```

3. Open your browser and type a request like:
   - `cancel case CASE-2024-TEST-001`
   - `cancel order ORDER-2024-001`
   - `change order status to completed`

## API Configuration

The API endpoint is configured in `src/App.tsx`. By default, it connects to:
- **URL**: `http://localhost:8093/v1/request`
- **Headers**: Includes X-User-ID, X-Idempotency-Key, and Authorization

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **CSS3** for styling (no external CSS frameworks)

## Project Structure

```
src/
  ├── App.tsx          # Main application component
  ├── App.css          # Application styles
  ├── types.ts         # TypeScript type definitions
  ├── main.tsx         # Application entry point
  └── index.css        # Global styles
```
