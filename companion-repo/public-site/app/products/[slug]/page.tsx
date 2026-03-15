// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { clientEnv } from '@/lib/env';

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
      { next: { revalidate: 3600 } },
    );

    if (res.status === 404) return null;
    if (!res.ok) return null;

    return ProductDetailSchema.parse(await res.json());
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${clientEnv.NEXT_PUBLIC_API_URL}/products`);
    if (!res.ok) return [];
    const products = z.array(z.object({ slug: z.string() })).parse(await res.json());

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch {
    // API unavailable at build time — fall back to dynamic rendering
    return [];
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
      images: [`https://cdn.ewbanking.com/products/${product.slug}.jpg`],
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
        <Image
          src={`https://cdn.ewbanking.com/products/${product.slug}.jpg`}
          alt={product.name}
          width={600}
          height={400}
          className="rounded-xl"
          priority
        />

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
              Minimum deposit: ₱{product.minDeposit.toLocaleString('en-PH')}
            </p>
          )}

          <h2 className="mt-8 text-xl font-semibold text-gray-900">Features</h2>
          <ul className="mt-4 space-y-2">
            {product.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 text-ewb-lime-700">✓</span>
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">Requirements</h2>
          <ul className="mt-4 space-y-2">
            {product.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
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
