#!/bin/bash
echo "=============================================================================="
echo "📡 SKILLBRIDGE MONITOR - LIVE REAL-TIME CLOUD TRAFFIC DEPLOYMENT STREAM"
echo "=============================================================================="
echo "Press Ctrl+C at any time to exit the live metric console window view."
echo "------------------------------------------------------------------------------"
vercel logs skillbridge-nine-mu.vercel.app --cwd apps/web --follow
