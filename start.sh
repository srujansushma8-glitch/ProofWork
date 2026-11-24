#!/usr/bin/env bash
echo "========================================================"
echo "Starting ProofWork: Electrician Skill Passport & Matching"
echo "========================================================"

# Start backend
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

sleep 2

# Start frontend
cd frontend && npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo "ProofWork running:"
echo "Frontend: http://127.0.0.1:5173"
echo "Backend:  http://127.0.0.1:8000/docs"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
