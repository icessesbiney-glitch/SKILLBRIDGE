# SkillBridge Live Production Launch Checklists

## 1. Database Initialization
Copy the scripts below and execute them within your Supabase SQL Editor Dashboard:

```sql
-- Run database migrations from: database/marketplace_production_schema.sql
-- Run wallet ledger routines from: supabase_wallet_logic.sql
-- Run trigger mutations from: database/supabase_wallet_triggers.sql
```

## 2. Production Environment Keys
Ensure the following variable models match your host configuration interfaces:
* `NEXT_PUBLIC_SUPABASE_URL` -> Production Project Database Endpoint Url
* `SUPABASE_SERVICE_ROLE_KEY` -> Secure Backend Master Stored Token Key
* `PAYSTACK_SECRET_KEY` -> Live Gateway Authorization Secret Token

## 3. Desktop Release Binaries
Compile standalone desktop installers by running the local package scripts.
