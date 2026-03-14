// src/pages/dashboard-page.tsx
import { FormattedMessage, FormattedDate } from 'react-intl';

interface DashboardUser {
  name: string;
  lastLoginAt: string | Date;
}

export function DashboardPage({ user }: { user: DashboardUser }) {
  return (
    <div>
      <h1>
        <FormattedMessage id="dashboard.greeting" values={{ name: user.name }} />
      </h1>
      <p className="text-sm text-gray-600">
        <FormattedMessage
          id="dashboard.lastLogin"
          values={{
            date: (
              <FormattedDate
                value={user.lastLoginAt}
                year="numeric"
                month="long"
                day="numeric"
                hour="numeric"
                minute="numeric"
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
