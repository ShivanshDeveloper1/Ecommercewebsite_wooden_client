import CartPage from "@/components/CartPage";
import CustomerShell from "@/components/CustomerShell";

export const metadata = {
  title: "Your bag | Form & Forest",
};

export default function CartRoute() {
  return (
    <CustomerShell>
      <CartPage />
    </CustomerShell>
  );
}