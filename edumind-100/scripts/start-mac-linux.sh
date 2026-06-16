#!/bin/bash
# EduMind AI — One-click startup for Mac/Linux

echo ""
echo "=========================================="
echo "  EduMind AI — World No.1 Starting Up"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found!"
    echo "Install from: https://nodejs.org"
    exit 1
fi
echo "[1/3] Node.js $(node --version): OK"

# Check .env
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "ERROR: backend/.env not found!"
    echo "Run: cd backend && cp .env.example .env"
    echo "Then add GROQ_API_KEY and JWT_SECRET"
    exit 1
fi
echo "[2/3] backend/.env: OK"

# Install deps if needed
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi
if [ ! -d "frontend/edumind-ai/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend/edumind-ai && npm install && cd ../..
fi
echo "[3/3] Dependencies: OK"

echo ""
echo "Starting Backend on :3001..."
cd backend && npm run dev &
BACKEND_PID=$!
sleep 4

echo "Starting Frontend on :5173..."
cd ../frontend/edumind-ai && npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "=========================================="
echo "  EduMind AI is RUNNING!"
echo ""
echo "  Backend:  http://localhost:3001/health"
echo "  Frontend: http://localhost:5173"
echo "=========================================="
echo ""

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
fi

echo "Press Ctrl+C to stop both servers"
wait $BACKEND_PID $FRONTEND_PID
