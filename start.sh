#!/bin/bash

echo "🚀 Starting OpsGuide Application"
echo ""
echo "Make sure you have:"
echo "  1. Python 3.11+ installed"
echo "  2. Backend dependencies installed (pip install -r requirements.txt)"
echo "  3. Node.js 18+ and npm installed"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Check if backend is already running
if lsof -Pi :8093 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend already running on port 8093"
    BACKEND_PID=""
else
    echo "📡 Starting backend server..."
    cd /Users/hiteshtawar/ops-guide-mvp
    
    # Try python3 first, then python
    if command -v python3 &> /dev/null; then
        python3 server.py &
        BACKEND_PID=$!
    elif command -v python &> /dev/null; then
        python server.py &
        BACKEND_PID=$!
    else
        echo "❌ Error: Python not found. Please install Python 3.11+"
        exit 1
    fi
    
    echo "Backend started with PID: $BACKEND_PID"
    sleep 3
    
    # Verify backend started successfully
    if ! lsof -Pi :8093 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Error: Backend failed to start on port 8093"
        echo "Please check if port 8093 is available and Python dependencies are installed"
        exit 1
    fi
    
    echo "✅ Backend is running on port 8093"
fi

# Start frontend
echo "🎨 Starting frontend UI..."
cd /Users/hiteshtawar/ops-guide-ui
npm run dev

# Cleanup on exit
cleanup() {
    if [ ! -z "$BACKEND_PID" ]; then
        echo ""
        echo "🛑 Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
}

trap cleanup EXIT INT TERM

