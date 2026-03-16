// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { clientEnv } from '@/lib/env';
import { mockProducts } from '@/lib/mock-data';

const ProductDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  interestRate: z.number().nonnegative().optional(),
  features: z.array(z.string()),
  requirements: z.array(z.string()),
  minDeposit: z.number().int().nonnegative().optional(), // centavos
});

type ProductDetail = z.infer<typeof ProductDetailSchema>;

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(
      `${clientEnv.NEXT_PUBLIC_API_URL}/products/${slug}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) },
    );

    if (res.status === 404 || !res.ok) {
      // API returned error — try mock data for local development
      const mock = mockProducts.find((p) => p.slug === slug);
      return mock ? ProductDetailSchema.parse(mock) : null;
    }

    return ProductDetailSchema.parse(await res.json());
  } catch {
    // API unavailable — fall back to mock data for local development
    const mock = mockProducts.find((p) => p.slug === slug);
    return mock ? ProductDetailSchema.parse(mock) : null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/products`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return mockProducts.map((p) => ({ slug: p.slug }));
    }
    const products = z.array(z.object({ slug: z.string() })).parse(await res.json());

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch {
    // API unavailable at build time — use mock slugs for static generation
    return mockProducts.map((p) => ({ slug: p.slug }));
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found | EastWest Bank' };
  }

  return {
    title: `${product.name} | EastWest Bank`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [`/products/${product.slug}.jpg`],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-gradient-to-br from-ewb-purple/10 to-ewb-navy/10">
          <span className="text-3xl font-bold text-ewb-purple/30">{product.name}</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-gray-600">{product.description}</p>

          {product.interestRate != null && (
            <p className="mt-4 text-2xl font-bold text-ewb-purple">
              {product.interestRate}% p.a.
            </p>
          )}

          {product.minDeposit != null && (
            <p className="mt-2 text-sm text-gray-500">
              Minimum deposit: ₱{(product.minDeposit / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          )}

          <h2 className="mt-8 text-xl font-semibold text-gray-900">Features</h2>
          <ul className="mt-4 space-y-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-1 text-emerald-700">✓</span>
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">Requirements</h2>
          <ul className="mt-4 space-y-2">
            {product.requirements.map((req) => (
              <li key={req} className="flex items-start gap-2">
                <span className="mt-1 text-gray-400">•</span>
                <span className="text-gray-600">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
