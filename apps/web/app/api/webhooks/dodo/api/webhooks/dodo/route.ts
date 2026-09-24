import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: Request) {
  try {
    // 1. Read the secure payload event data sent over from Dodo Payments
    const payload = await request.json();
    
    // Verify that the event is a successful payment capture
    if (payload.type === 'payment.succeeded' && payload.data) {
      const transactionId = payload.data.id;
      const amount = payload.data.total_amount / 100; // Convert to standard GHS decimal value
      const userId = payload.data.metadata?.user_id; // Read the target learner ID bound to the checkout session

      if (!userId) {
        return new NextResponse('Missing learner ID mapping in metadata', { status: 400 });
      }

      // 2. Insert transaction directly into your new table. Your trigger function handles the balance credit!
      const { error } = await supabase
        .from('dodo_payments_log')
        .insert({
          transaction_id: transactionId,
          user_id: userId,
          amount: amount,
          status: 'succeeded'
        });

      if (error) {
        console.error('Database transaction insert failure:', error);
        return new NextResponse('Database processing failed', { status: 500 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook processing endpoint error context:', err);
    return new NextResponse('Webhook runtime crash', { status: 500 });
  }
}
