#!/bin/bash
echo "=============================================================================="
echo "🌐 SKILLBRIDGE NETWORKS - PREMIUM DOMAIN ASSOCIATION ASSERTER"
echo "=============================================================================="
echo "Enter your purchased custom domain below (e.g., skillbridge.com or skillbridge.com.gh)"
read -p "Target Domain Name: " CUSTOM_DOMAIN

if [ ! -z "$CUSTOM_DOMAIN" ]; then
    echo "[CONFIG] Linking premium web surface domain '$CUSTOM_DOMAIN' directly to Vercel..."
    vercel domains add "$CUSTOM_DOMAIN" --cwd apps/web --yes
    echo ""
    echo "📢 NEXT STEP CONFIGURATION REQUIRED:"
    echo "------------------------------------------------------------------------------"
    echo "Log into your domain registrar (GoDaddy, Namecheap, Whogohost, etc.) and add:"
    echo "👉 TYPE: CNAME  |  NAME: www  |  VALUE: ://vercel-dns.com."
    echo "👉 TYPE: A      |  NAME: @    |  VALUE: 76.76.21.21"
    echo "------------------------------------------------------------------------------"
else
    echo "❌ Error: Invalid domain input parameter string."
fi
