#!/bin/bash
echo "=============================================================================="
echo "🔒 SKILLBRIDGE FINTECH GATEWAY - PRODUCTION LIVE-MODE SYNC RUNNER"
echo "=============================================================================="
echo "⚠️ WARNING: This will override current Vercel production credentials with real live processing profiles."
echo ""

# Configuration Placeholders - Replace these with your real, live tokens when launching
LIVE_PAYSTACK_SECRET="sk_live_replace_this_with_your_actual_live_secret_key"
LIVE_PAYSTACK_WEBHOOK_SECRET="wh_live_replace_this_with_your_actual_live_webhook_secret"

read -p "Are you absolutely ready to toggle your production configurations to LIVE? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    echo "[SYNC] Force updating Vercel environment cloud parameters with live keys..."
    
    # Securely remove old keys and inject live production tokens directly into Vercel
    vercel env rm PAYSTACK_SECRET_KEY production --yes 2>/dev/null
    printf "$LIVE_PAYSTACK_SECRET" | vercel env add PAYSTACK_SECRET_KEY production
    
    vercel env rm PAYSTACK_WEBHOOK_SECRET production --yes 2>/dev/null
    printf "$LIVE_PAYSTACK_WEBHOOK_SECRET" | vercel env add PAYSTACK_WEBHOOK_SECRET production
    
    echo "[BUILD] Redeploying precompiled application architecture to activate updates..."
    vercel deploy --prebuilt --prod --cwd apps/web --force --yes
    echo "✅ SUCCESS: FinTech framework is now processing real money transactions on Ghana mobile networks!"
else
    echo "❌ Operation cancelled. Staging environment parameters remain safely active."
fi
