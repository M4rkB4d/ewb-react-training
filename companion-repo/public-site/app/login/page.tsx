// app/login/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Log In | EastWest Bank',
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Log In</h1>
      <p className="mt-2 text-gray-600">
        Access your EastWest Bank account through our secure portal.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          Online banking is available through the EWB Portal application.
        </p>
        <p className="mt-4 text-xs text-gray-400">
          This public site does not handle authentication directly.
          In production, this page would redirect to the portal login.
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-ewb-purple hover:underline"
      >
        &larr; Back to Home
      </Link>
    </main>
  );
}
