#!/bin/bash
echo "=== INITIALIZING MONOREPO GLOBAL CLEANUP ROUTINE ==="

# 1. Kill any active background processes running on project preview port nodes
echo "[CLEANER] Terminating conflicting background processes..."
kill -9 $(lsof -t -i:3000-3005) 2>/dev/null

# 2. Clear dense build cache directories to free local storage boundaries
echo "[CLEANER] Purging heavy application caches..."
rm -rf /workspaces/SKILLBRIDGE/apps/web/.next
rm -rf /workspaces/SKILLBRIDGE/apps/web/.turbo
rm -rf /workspaces/SKILLBRIDGE/apps/desktop/dist

echo "=== SYSTEM INFRASTRUCTURE SUCKERS SUCCESSFULLY CLEANED ==="
