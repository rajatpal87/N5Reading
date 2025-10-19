#!/bin/bash

echo "🔄 Restarting N5 Reading servers..."
echo ""

# Kill existing processes
echo "Stopping existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

# Start backend
echo "Starting backend..."
cd /Users/rajatpal/N5Reading/backend
nohup npm start > /tmp/backend.log 2>&1 &
sleep 5

# Start frontend
echo "Starting frontend..."
cd /Users/rajatpal/N5Reading/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
sleep 5

# Test servers
echo ""
echo "=== Testing Servers ==="
curl -s http://localhost:3000/api/health | jq -r '"✅ Backend: " + .status' || echo "❌ Backend failed"
curl -s -o /dev/null -w "✅ Frontend: HTTP %{http_code}\n" http://localhost:5173 || echo "❌ Frontend failed"

echo ""
echo "════════════════════════════════════"
echo "   Servers Restarted!"
echo "   Open: http://localhost:5173"
echo "════════════════════════════════════"

