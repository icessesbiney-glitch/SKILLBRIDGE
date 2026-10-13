import { NextRequest, NextResponse } from "next/server";
import { logTerminalTrackingError } from "../../../utils/errorLogger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rider_name = body?.rider_name || "Unknown";
    const current_status = body?.current_status || "offline";
    const customer_distance = Number(body?.customer_distance || 0);
    
    if (current_status === "active" && customer_distance < 0.5) {
      const templateMessage = `ALERT FOR ${rider_name.toUpperCase()}: You are currently within ${customer_distance}km of the destination. Rejections violate platform guidelines.`;
      
      return NextResponse.json({
        status: "dispatched",
        payload_delivery: templateMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ status: "skipped", reason: "Criteria conditions not met" });
  } catch (err: any) {
    logTerminalTrackingError(err?.message || "Unknown routing break occurred");
    return NextResponse.json({ error: "Pipeline processing crash" }, { status: 500 });
  }
}