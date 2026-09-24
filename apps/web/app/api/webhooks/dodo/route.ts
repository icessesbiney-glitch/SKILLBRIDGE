import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    if (payload.type === 'payment.succeeded' && payload.data) {
      const transactionId = payload.data.id;
      const amount = payload.data.total_amount / 100; 
      const userId = payload.data.metadata?.user_id; 

      if (!userId) {
        return new NextResponse('Missing learner ID mapping in metadata', { status: 400 });
      }

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
