'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface RiderWalletCardProps {
  riderProfileId: string;
}

interface TransactionRow {
  id: string;
  amount: number;
  transaction_type: 'delivery_payout' | 'compliance_penalty' | 'withdrawal_payout';
  reference_id: string;
  created_at: string;
}

export default function RiderWalletCard({ riderProfileId }: RiderWalletCardProps) {
  const [balance, setBalance] = useState<number>(0.00);
  const [history, setHistory] = useState<TransactionRow[]>([]);
  const [amountInput, setAmountInput] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [network, setNetwork] = useState<'MTN' | 'VOD' | 'ATL'>('MTN');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const fetchWalletMetrics = async () => {
    // 1. Fetch live balance ledger records
    const { data: wallet } = await supabase
      .from('rider_wallets')
      .select('id, current_balance')
      .eq('rider_profile_id', riderProfileId)
      .single();

    if (wallet) {
      setBalance(wallet.current_balance);

      // 2. Query structural list arrays of the 5 most recent accounting items
      const { data: txs } = await supabase
        .from('wallet_transactions')
        .select('id, amount, transaction_type, reference_id, created_at')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (txs) setHistory(txs as any[]);
    }
  };

  useEffect(() => {
    fetchWalletMetrics();

    // Subscribe to realtime transactional ledger table alerts mapping this wallet channel
    const ledgerSubscription = supabase
      .channel(`wallet-ledger-${riderProfileId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rider_wallets', filter: `rider_profile_id=eq.${riderProfileId}` }, () => fetchWalletMetrics())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wallet_transactions' }, () => fetchWalletMetrics())
      .subscribe();

    return () => {
      supabase.removeChannel(ledgerSubscription);
    };
  }, [riderProfileId]);

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || !mobileNumber || loading) return;
    
    const cashoutValue = parseFloat(amountInput);
    if (cashoutValue <= 0 || cashoutValue > balance) {
      setStatusMessage('❌ Invalid withdrawal cashout balance bounds execution value.');
      return;
    }

    setLoading(true);
    setStatusMessage('📡 Initializing Paystack mobile money money transfer protocols...');

    try {
      const response = await fetch('/api/rider/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderProfileId,
          mobileNumber,
          bankCode: network,
          withdrawalAmount: cashoutValue
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Serverless gateway exception network error');
      
      setStatusMessage(`✅ [SUCCESS] Transfer processed cleanly. Ref ID: ${result.reference}`);
      setAmountInput('');
      fetchWalletMetrics();
    } catch (err: any) {
      setStatusMessage(`❌ [PAYMENT ERROR]: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl font-mono text-xs text-white max-w-sm w-full space-y-4">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <h3 className="font-bold uppercase tracking-wider text-cyan-400">Rider Financial Wallet</h3>
        <span className="text-[10px] text-slate-500">GHS Ledger Matrix</span>
      </div>

      {/* Account balance card mapping container layout row */}
      <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center">
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Available Ledger Balance</div>
        <div className={`text-2xl font-bold tracking-tight ${balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          GHS {balance.toFixed(2)}
        </div>
      </div>

      {/* Interactive Mobile Money payment routing input field sets layout template */}
      <form onSubmit={handleWithdrawalRequest} className="space-y-3">
        <div className="text-slate-400 font-bold uppercase text-[10px]">Execute Cashout Outflow:</div>
        
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Amount (GHS)"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
            required
          />
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-yellow-500 font-bold outline-none"
          >
            <option value="MTN">MTN MoMo</option>
            <option value="VOD">Telecel Cash</option>
            <option value="ATL">AT Money</option>
          </select>
        </div>

        <input
          type="tel"
          placeholder="Mobile Wallet Number (e.g. 055...)"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
          required
        />

        <button
          type="submit"
          disabled={loading || !amountInput || !mobileNumber}
          className="w-full py-2.5 bg-cyan-950/40 border border-cyan-500 text-cyan-400 uppercase font-bold rounded-lg hover:bg-cyan-900 transition-colors disabled:opacity-40"
        >
          {loading ? 'Disbursing Funds...' : 'Request Instant Payout'}
        </button>
      </form>

      {statusMessage && (
        <div className="p-2 bg-slate-950 rounded border border-slate-850 text-[10px] break-words">
          {statusMessage}
        </div>
      )}

      {/* Transaction historical ledger feed list logs rows block container */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-slate-400 font-bold uppercase text-[10px] mb-2">Recent Transaction Matrix Ledger Logs:</div>
        {history.length === 0 ? (
          <div className="text-center text-slate-600 py-2">No historical double-entry logs archived inside this account cell.</div>
        ) : (
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
            {history.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center border-b border-slate-850/50 pb-1 text-[11px]">
                <div className="truncate max-w-[180px]">
                  <div className="text-slate-300 font-semibold">{tx.transaction_type.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-[9px] text-slate-500">{tx.reference_id}</div>
                </div>
                <span className={`font-bold ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {tx.amount < 0 ? '-' : '+'} GHS {Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
