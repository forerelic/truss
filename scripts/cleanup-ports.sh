#!/usr/bin/env bash
# Cleanup script to kill processes on ports 3000 and 1420
# Run this if you get "EADDRINUSE" errors

set -e

echo "🧹 Cleaning up ports 3000 and 1420..."

# Function to kill process on port
kill_port() {
  local port=$1
  local pid=$(lsof -ti:$port 2>/dev/null)

  if [ -z "$pid" ]; then
    echo "✓ Port $port is free"
    return 0
  fi

  echo "⚠️  Port $port is in use by PID $pid"
  echo "   Sending SIGTERM (graceful shutdown)..."
  kill -15 $pid 2>/dev/null || true

  # Wait up to 5 seconds for graceful shutdown
  for i in {1..5}; do
    sleep 1
    if ! kill -0 $pid 2>/dev/null; then
      echo "✓ Port $port freed (graceful)"
      return 0
    fi
  done

  # Force kill if still running
  echo "   Process didn't respond, sending SIGKILL..."
  kill -9 $pid 2>/dev/null || true
  sleep 1

  if ! kill -0 $pid 2>/dev/null; then
    echo "✓ Port $port freed (forced)"
  else
    echo "❌ Failed to free port $port"
    return 1
  fi
}

# Clean both ports
kill_port 3000
kill_port 1420

echo ""
echo "✨ Ports cleaned! You can now run dev commands."
