import { Suspense } from "react";
import SuccessViewContainer from "./success-view";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading payment verification details...</div>}>
      <SuccessViewContainer />
    </Suspense>
  );
}
