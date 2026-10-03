import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { amount, currency, email, provider, userId, metadata } = await request.json();

    if (!amount || !email || !userId) {
      return NextResponse.json({ error: 'Missing required checkout fields' }, { status: 400 });
    }

    if (provider === 'paystack') {
      const response = await fetch('https://paystack.co', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          currency,
          metadata: { ...metadata, userId, provider: 'paystack' },
        }),
      });
      const data = await response.json();
      if (!data.status) throw new Error(data.message);
      return NextResponse.json({ checkoutUrl: data.data.authorization_url, reference: data.data.reference });
    } 
    
    if (provider === 'dodo') {
      const response = await fetch('https://dodopayments.com', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DODO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          customer: { email },
          metadata: { ...metadata, userId, provider: 'dodo' },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Dodo transaction initialization failed');
      return NextResponse.json({ checkoutUrl: data.checkout_url, paymentId: data.id });
    }

    return NextResponse.json({ error: 'Unsupported gateway provider selection' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server processing Error' }, { status: 500 });
  }
}
