#!/bin/bash
# Wrapper script that keeps the PyTheory service alive.
# Restarts the Python service if it dies.

cd "$(dirname "$0")"

while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting PyTheory service..."
    python3 main.py
    EXIT_CODE=$?
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PyTheory service exited with code $EXIT_CODE. Restarting in 2s..."
    sleep 2
done
