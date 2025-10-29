#!/bin/bash

echo "📡 Starting OpsGuide Backend Server"
echo ""

cd /Users/hiteshtawar/ops-guide-mvp

# Check if backend is already running
if lsof -Pi :8093 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend already running on port 8093"
    echo "Access at: http://localhost:8093"
    exit 0
fi

# Try python3 first, then python
if command -v python3 &> /dev/null; then
    echo "🚀 Starting with python3..."
    python3 server.py
elif command -v python &> /dev/null; then
    echo "🚀 Starting with python..."
    python server.py
else
    echo "❌ Error: Python not found. Please install Python 3.11+"
    exit 1
fi

