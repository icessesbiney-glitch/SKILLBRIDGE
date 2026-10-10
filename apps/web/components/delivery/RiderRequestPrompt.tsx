'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface RiderRequestProps {
  riderProfileId: string;
  onAssignmentResolved: () => void;
}

interface ActiveOrderAssignment {
  id: string;
  order_id: string;
  delivery_orders: {
    order_reference: string;
    pickup_latitude: number;
    pickup_longitude: number;
    delivery_latitude: number;
    delivery_longitude: number;
    order_total: number;
  };
}

export default function RiderRequestPrompt({ riderProfileId, onAssignmentResolved }: RiderRequestProps) {
  const [activeRequest, setActiveRequest] = useState<ActiveOrderAssignment | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    // Subscribe to real-time order assignments targeting this specific rider
    const dispatchChannel = supabase
      .channel(`rider-dispatch-${riderProfileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `rider_profile_id=eq.${riderProfileId}`
        },
        async (payload: any) => {
          if (payload.new.assignment_status === 'pending') {
            // Fetch nested order metadata fields to populate the card interface metrics
            const { data: orderData } = await supabase
              .from('delivery_orders')
              .select('order_reference, pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, order_total')
              .eq('id', payload.new.order_id)
              .single();

            if (orderData) {
              setActiveRequest({
                id: payload.new.id,
                order_id: payload.new.order_id,
                delivery_orders: orderData as any
              });
              setCountdown(30);
              // Trigger a system alert notification tone safely inside the browser context
              try {
                const audio = new Audio('https://mixkit.co');
                audio.volume = 0.5;
                audio.play();
              } catch (e) {
                console.log('Audio playback delayed due to browser interaction policies');
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dispatchChannel);
    };
  }, [riderProfileId]);

  // Handle countdown timeout tick matrices
  useEffect(() => {
    if (activeRequest && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeRequest && countdown === 0) {
      handleResolution('expired', 'Timeout expiration matrix threshold reached');
    }
  }, [activeRequest, countdown]);

  const handleResolution = async (status: 'accepted' | 'declined' | 'expired', reason?: string) => {
    if (!activeRequest || processing) return;
    setProcessing(true);

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    try {
      // 1. Core transactional update to change the status of the dispatch row item
      const { error: updateError } = await supabase
        .from('delivery_assignments')
        .update({
          assignment_status: status,
          decline_reason: reason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeRequest.id);

      if (updateError) throw updateError;

      // 2. File a violation penalty compliance log if the rider declines or lets it time out
      if (status === 'declined' || status === 'expired') {
        await supabase.from('rider_compliance_logs').insert([
          {
            rider_profile_id: riderProfileId,
            order_id: activeRequest.order_id,
            violation_type: status === 'declined' ? 'proximity_decline' : 'timeout_expiry',
            penalty_fee: 2.50 // Apply a standardized GHS 2.50 system penalty charge modifier
          }
        ]);
      }

      setActiveRequest(null);
      onAssignmentResolved();
    } catch (err: any) {
      alert(`Dispatch resolution critical block error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!activeRequest) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4 z-50 font-mono text-xs text-white">
      <div className="bg-slate-900 border border-amber-500 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm animate-pulse">Incoming Order Alert</h3>
            <p className="text-[10px] text-slate-400">Ref: {activeRequest.delivery_orders.order_reference}</p>
          </div>
          <div className="text-xl font-bold bg-amber-950/40 text-amber-400 border border-amber-500 rounded-full w-12 h-12 flex justify-center items-center animate-bounce">
            {countdown}s
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl space-y-2 border border-slate-850">
          <div className="text-slate-400 font-bold uppercase text-[10px]">Route Metric Arrays:</div>
          <div><span className="text-cyan-400">Pickup LAT/LNG:</span> {activeRequest.delivery_orders.pickup_latitude.toFixed(5)}, {activeRequest.delivery_orders.pickup_longitude.toFixed(5)}</div>
          <div><span className="text-cyan-400">Dropoff LAT/LNG:</span> {activeRequest.delivery_orders.delivery_latitude.toFixed(5)}, {activeRequest.delivery_orders.delivery_longitude.toFixed(5)}</div>
          <div className="border-t border-slate-850 mt-2 pt-2 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-400 uppercase text-xs">Payout Matrix:</span>
            <span className="text-emerald-400">GHS {activeRequest.delivery_orders.order_total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled={processing}
            onClick={() => handleResolution('declined', 'Rider manually skipped request matrix')}
            className="flex-1 py-3 bg-rose-950/40 border border-rose-500 text-rose-400 font-bold uppercase rounded-xl hover:bg-rose-900 transition-colors disabled:opacity-50"
          >
            Decline Order
          </button>
          <button
            disabled={processing}
            onClick={() => handleResolution('accepted')}
            className="flex-1 py-3 bg-emerald-950/40 border border-emerald-500 text-emerald-400 font-bold uppercase rounded-xl hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-950/50 disabled:opacity-50"
          >
            Accept Request
          </button>
        </div>
      </div>
    </div>
  );
}
