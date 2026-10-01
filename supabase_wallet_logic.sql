-- Run this block inside the SQL Editor of your Supabase Dashboard

-- 1. Create a secure function to increment rider wallets via Paystack webhook hits
CREATE OR REPLACE FUNCTION increment_wallet_balance(user_email TEXT, amount_to_add NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + amount_to_add
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a secure function to decrement rider wallets via Mobile Cashouts
CREATE OR REPLACE FUNCTION decrement_wallet_balance(user_email TEXT, amount_to_sub NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) - amount_to_sub
  WHERE email = user_email AND wallet_balance >= amount_to_sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
