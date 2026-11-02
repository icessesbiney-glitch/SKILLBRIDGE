'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

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

type AssignmentRow = {
  id: string;
  order_id: string;
  assignment_status: 'pending' | 'accepted' | 'declined' | 'expired';
};

type OrderRow = ActiveOrderAssignment['delivery_orders'];

export default function RiderRequestPrompt({ riderProfileId, onAssignmentResolved }: RiderRequestProps) {
  const [activeRequest, setActiveRequest] = useState<ActiveOrderAssignment | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRequest = async (assignment: AssignmentRow) => {
      const { data: orderData, error } = await supabase
        .from('delivery_orders')
        .select('order_reference, pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, order_total')
        .eq('id', assignment.order_id)
        .single();

      if (error) throw error;
      if (!cancelled) {
        setActiveRequest({
          id: assignment.id,
          order_id: assignment.order_id,
          delivery_orders: orderData as OrderRow
        });
        setCountdown(30);
        setErrorMessage(null);
      }
    };

    const loadPendingRequest = async () => {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select('id, order_id, assignment_status')
        .eq('rider_profile_id', riderProfileId)
        .eq('assignment_status', 'pending')
        .order('assigned_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) await loadRequest(data as AssignmentRow);
    };

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
        },
        async (payload) => {
          const assignment = payload.new as Partial<AssignmentRow>;
          if (
            assignment.assignment_status === 'pending' &&
            typeof assignment.id === 'string' &&
            typeof assignment.order_id === 'string'
          ) {
            try {
              await loadRequest(assignment as AssignmentRow);
            } catch (error) {
              console.error('Unable to load incoming rider assignment', error);
              if (!cancelled) setErrorMessage('Unable to load this delivery request. Please refresh and try again.');
            }
          }
        }
      )
      .subscribe();

    void loadPendingRequest().catch((error: unknown) => {
      console.error('Unable to load pending rider assignment', error);
      if (!cancelled) setErrorMessage('Unable to check for pending delivery requests.');
    });

    return () => {
      cancelled = true;
      supabase.removeChannel(dispatchChannel);
    };
  }, [riderProfileId]);

  useEffect(() => {
    if (activeRequest && countdown > 0) {
        const timer = setTimeout(() => setCountdown((current) => current - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeRequest && countdown === 0) {
        void handleResolution('expired');
    }
  }, [activeRequest, countdown]);

  const handleResolution = async (status: 'accepted' | 'declined' | 'expired', reason?: string) => {
    if (!activeRequest || processing) return;
    setProcessing(true);

    try {
      const { data: resolvedAssignment, error: updateError } = await supabase
        .from('delivery_assignments')
        .update({
          assignment_status: status,
          decline_reason: reason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeRequest.id)
        .eq('assignment_status', 'pending')
        .select('id')
        .maybeSingle();

      if (updateError) throw updateError;
      if (!resolvedAssignment) throw new Error('This delivery request was already resolved.');

      if (status === 'declined' || status === 'expired') {
        const { error: complianceError } = await supabase.from('rider_compliance_logs').insert([
          {
            rider_profile_id: riderProfileId,
            order_id: activeRequest.order_id,
            violation_type: status === 'declined' ? 'proximity_decline' : 'timeout_expiry',
            penalty_fee: 2.50
          }
        ]);
        if (complianceError) throw complianceError;
      }

      setActiveRequest(null);
      setErrorMessage(null);
      onAssignmentResolved();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to resolve this delivery request.';
      console.error('Unable to resolve rider assignment', error);
      setErrorMessage(message);
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
          <div className="text-xl font-bold bg-amber-950/40 text-amber-400 border border-amber-500 rounded-full w-12 h-12 flex justify-center items-center">
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
            className="flex-1 py-3 bg-rose-950/40 border border-rose-500 text-rose-400 font-bold uppercase rounded-xl hover:bg-rose-900 transition-colors"
          >
            Decline
          </button>
          <button
            disabled={processing}
            onClick={() => handleResolution('accepted')}
            className="flex-1 py-3 bg-emerald-950/40 border border-emerald-500 text-emerald-400 font-bold uppercase rounded-xl hover:bg-emerald-900 transition-colors"
          >
            Accept
          </button>
        </div>
        {errorMessage && (
          <p role="alert" className="rounded-lg border border-rose-500/60 bg-rose-950/40 p-3 text-rose-300">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
