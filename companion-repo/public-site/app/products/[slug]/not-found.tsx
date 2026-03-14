// app/products/[slug]/not-found.tsx
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
      <p className="mt-4 text-gray-600">
        The product you are looking for does not exist or may have been
        discontinued.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-block rounded-lg bg-ewb-purple px-6 py-2 text-white hover:bg-ewb-purple/90"
      >
        Browse All Products
      </Link>
    </div>
  );
}
