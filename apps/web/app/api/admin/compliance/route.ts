import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('✅ Local Compliance payload parsed successfully:', data.fullName);
    return NextResponse.json({ status: 'Compliance data processed successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
