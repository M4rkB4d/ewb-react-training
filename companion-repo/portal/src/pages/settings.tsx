// src/pages/settings.tsx
import { PasskeySettings } from '@/features/auth/components/passkey-settings';
import { ConsentManager } from '@/features/consent/components/consent-manager';

export function Component() {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-ewb-navy">Settings</h1>

      <section>
        <PasskeySettings />
      </section>

      <hr className="border-gray-200" />

      <section>
        <ConsentManager />
      </section>
    </div>
  );
}
