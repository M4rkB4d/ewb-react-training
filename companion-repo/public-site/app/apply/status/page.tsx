// app/apply/status/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverEnv } from '@/lib/env';

const ApplicationSchema = z.object({
  id: z.string(),
  type: z.enum(['personal-loan', 'credit-card', 'mortgage']),
  status: z.enum(['submitted', 'under-review', 'approved', 'rejected']),
  submittedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  referenceNumber: z.string(),
});

const ApplicationListSchema = z.array(ApplicationSchema);

async function verifySession(sessionToken: string) {
  const res = await fetch(`${serverEnv.INTERNAL_AUTH_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serverEnv.AUTH_SERVICE_KEY}`,
    },
    body: JSON.stringify({ token: sessionToken }),
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return z.object({ userId: z.string(), email: z.string() }).parse(await res.json());
}

async function getApplications(userId: string) {
  const res = await fetch(
    `${serverEnv.INTERNAL_API_URL}/users/${userId}/applications`,
    {
      headers: { Authorization: `Bearer ${serverEnv.AUTH_SERVICE_KEY}` },
      cache: 'no-store',
    },
  );

  if (!res.ok) throw new Error('Failed to fetch applications');
  return ApplicationListSchema.parse(await res.json());
}

export default async function ApplicationStatusPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('ewb_session')?.value;

  if (!sessionToken) {
    redirect('/login?returnTo=/apply/status');
  }

  const session = await verifySession(sessionToken);

  if (!session) {
    redirect('/login?returnTo=/apply/status');
  }

  const applications = await getApplications(session.userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
      <p className="mt-2 text-gray-600">
        Track the progress of your loan and credit card applications.
      </p>

      {applications.length === 0 ? (
        <p className="mt-8 text-gray-500">You have no active applications.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {app.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </h2>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ref: {app.referenceNumber} · Submitted{' '}
                {new Date(app.submittedAt).toLocaleDateString('en-PH')}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

type ApplicationStatus = 'submitted' | 'under-review' | 'approved' | 'rejected';

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    'under-review': 'bg-yellow-100 text-yellow-800',
    approved: 'bg-ewb-lime-200 text-ewb-lime-700',
    rejected: 'bg-error/10 text-error',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}
