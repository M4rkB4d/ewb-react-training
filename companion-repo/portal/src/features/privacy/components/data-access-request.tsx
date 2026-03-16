// src/features/privacy/components/data-access-request.tsx
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { emitAuditEvent } from '@/compliance/audit-service';

export function DataAccessRequest() {
  const requestData = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/user/data-request', {
        type: 'access',
      });
      return response.data;
    },
    onSuccess: () => {
      emitAuditEvent('DATA_EXPORT', { type: 'access_request' });
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Request Your Data</h3>
      <p className="text-sm text-gray-600">
        Under the Data Privacy Act, you have the right to request a copy of all
        personal data we hold about you. The report will be delivered to your
        registered email within 30 days.
      </p>
      <Button
        type="button"
        onClick={() => { requestData.mutate(); }}
        disabled={requestData.isPending}
      >
        {requestData.isPending ? 'Submitting...' : 'Request Data Export'}
      </Button>
      {requestData.isSuccess && (
        <p className="text-sm text-emerald-600" role="status">
          Your request has been submitted. You will receive your data export
          within 30 days.
        </p>
      )}
    </div>
  );
}
