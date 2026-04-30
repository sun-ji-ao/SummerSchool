import { CartStatusClient } from "./cart-status-client";

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Cart & Deposit</h1>
      <p className="mt-2 text-slate-600">
        支付完成后可通过 <code>/api/bookings/:id</code> 查询 booking/payment 状态。
      </p>
      <CartStatusClient />
    </main>
  );
}
