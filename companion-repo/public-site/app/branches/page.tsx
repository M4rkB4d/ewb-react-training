// app/branches/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Branch Locator | EastWest Bank',
  description: 'Find the nearest EastWest Bank branch to you.',
};

const sampleBranches = [
  { id: 1, name: 'Makati Main', address: 'The EastWest Corporate Center, Ortigas Center, Pasig City', hours: 'Mon-Fri 9:00 AM - 5:00 PM' },
  { id: 2, name: 'BGC Branch', address: '32nd Street, Bonifacio Global City, Taguig', hours: 'Mon-Fri 9:00 AM - 5:00 PM' },
  { id: 3, name: 'Cebu Business Park', address: 'Cebu Business Park, Cebu City', hours: 'Mon-Fri 9:00 AM - 4:00 PM' },
  { id: 4, name: 'Davao Downtown', address: 'J.P. Laurel Avenue, Davao City', hours: 'Mon-Fri 9:00 AM - 4:00 PM' },
];

export default function BranchesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Branch Locator</h1>
      <p className="mt-2 text-gray-600">
        Find the nearest EastWest Bank branch. Over 400 branches nationwide.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {sampleBranches.map((branch) => (
          <div
            key={branch.id}
            className="rounded-xl border border-gray-200 p-6"
          >
            <h2 className="font-semibold text-gray-900">{branch.name}</h2>
            <p className="mt-2 text-sm text-gray-600">{branch.address}</p>
            <p className="mt-1 text-xs text-gray-400">{branch.hours}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Showing sample branches for demonstration purposes.
        In production, this page would integrate with a branch locator API.
      </p>

      <Link
        href="/"
        className="mt-4 inline-block text-sm font-medium text-ewb-purple hover:underline"
      >
        &larr; Back to Home
      </Link>
    </main>
  );
}
