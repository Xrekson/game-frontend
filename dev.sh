#!/usr/bin/env bash

# Delegate to game-backend/dev.sh if present
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../game-backend" 2>/dev/null && pwd || echo "")"

if [ -n "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/dev.sh" ]; then
    "$BACKEND_DIR/dev.sh" "$@"
else
    case "$1" in
        start)
            echo "Starting Frontend Dev Server..."
            npm run dev
            ;;
        stop)
            echo "Stopping Frontend Dev Server..."
            pkill -f "ng serve" || true
            ;;
        *)
            echo "Usage: $0 {start|stop|status|restart}"
            ;;
    esac
fi
