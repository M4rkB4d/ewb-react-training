// src/components/ui/header.tsx
import Link from 'next/link';
import Image from 'next/image';

const navigation = [
  { label: 'Products', href: '/products' },
  { label: 'Rates', href: '/rates' },
  { label: 'Branches', href: '/branches' },
  { label: 'Apply', href: '/apply' },
];

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/ewb-logo.svg"
            alt="EastWest Bank"
            width={140}
            height={32}
            priority
          />
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-ewb-purple"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="https://portal.ewbanking.com"
          className="rounded-lg bg-ewb-purple px-4 py-2 text-sm font-medium text-white hover:bg-ewb-purple/90"
        >
          Log In
        </Link>
      </nav>
    </header>
  );
}
