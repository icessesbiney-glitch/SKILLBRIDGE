import { NextResponse } from "next/server";
import { logTerminalTrackingError } from "../../../utils/errorLogger";

export async function POST(request: Request) {
  try {
    const { rider_name, current_status, customer_distance } = await request.json();
    
    // Core Dispatch Business Logic Rule
    if (current_status === "active" && customer_distance < 0.5) {
      const templateMessage = `ALERT FOR ${rider_name.toUpperCase()}: You are currently within ${customer_distance}km of the customer destination. Order rejection while on close proximity status violates local platform guidelines and will result in penalties.`;
      
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