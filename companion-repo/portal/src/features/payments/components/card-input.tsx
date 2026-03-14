// src/features/payments/components/card-input.tsx
export function CardInput() {
  return (
    <div>
      <label htmlFor="card-frame">Card Number</label>
      {/* Payment processor's iframe — card data never touches our JavaScript */}
      <iframe
        id="card-frame"
        src="https://tokenizer.payment-processor.com/card-input"
        title="Secure card input"
        className="h-12 w-full rounded border"
      />
      <p className="text-xs text-gray-500">
        Card data is handled securely by our payment processor.
      </p>
    </div>
  );
}
