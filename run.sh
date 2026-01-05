#!/bin/bash

# Function to handle exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting MIET Chatbot System..."

# Start Backend
echo "-----------------------------------"
echo "Starting Backend Server..."
cd backend
# Check if venv exists
if [ -d "venv" ]; then
    # Determine the activation script based on OS
    if [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    elif [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi
fi

# Run backend in background
python main.py &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "-----------------------------------"
echo "Starting Frontend Server..."
cd frontend
# Run frontend in background
npm run dev &
FRONTEND_PID=$!
cd ..

echo "-----------------------------------"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Servers are running. Press Ctrl+C to stop."
echo "-----------------------------------"

# Wait for background processes
wait
