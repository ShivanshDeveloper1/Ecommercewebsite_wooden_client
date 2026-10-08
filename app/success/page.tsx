import SuccessPage from "@/components/SuccessPage";
import { Suspense } from "react";

export const metadata = {
  title: "Order confirmation | OudArs",
};

export default function SuccessRoutePage() {
  return(
    <Suspense fallback={<main className="section-wrap py-16 text-center text-sm">Loading order confirmation…</main>}>
      <SuccessPage />

    </Suspense>
    
  )
   
}
