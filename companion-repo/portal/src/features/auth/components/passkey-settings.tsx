// src/features/auth/components/passkey-settings.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { z } from 'zod';
import { PasskeyEnrollment } from './passkey-enrollment';
import { Button } from '@/components/ui/button';

const passkeySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().nullable(),
  deviceType: z.string(),
});

type Passkey = z.infer<typeof passkeySchema>;

function usePasskeys() {
  return useQuery({
    queryKey: ['passkeys'],
    queryFn: async () => {
      const response = await apiClient.get('/webauthn/credentials');
      return z.array(passkeySchema).parse(response.data);
    },
  });
}

function useDeletePasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/webauthn/credentials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] });
    },
  });
}

export function PasskeySettings() {
  const { data: passkeys, isLoading } = usePasskeys();
  const deletePasskey = useDeletePasskey();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Passkeys</h2>
        <p className="text-sm text-gray-600">
          Manage your registered passkeys for passwordless sign-in.
        </p>
      </div>

      <PasskeyEnrollment />

      {isLoading && <p aria-busy="true">Loading passkeys...</p>}

      {passkeys != null && passkeys.length > 0 && (
        <ul className="divide-y rounded border" role="list" aria-label="Registered passkeys">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{passkey.name}</p>
                <p className="text-xs text-gray-500">
                  {passkey.deviceType} · Added{' '}
                  {new Date(passkey.createdAt).toLocaleDateString('en-PH')}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm('Remove this passkey? You will not be able to sign in with it.')) {
                    deletePasskey.mutate(passkey.id);
                  }
                }}
                disabled={deletePasskey.isPending}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
