// src/features/transfers/hooks/use-create-transfer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransfer } from '../api/transfers-api';
import type { TransferRequest } from '../api/transfers-api';
import { accountKeys } from '@/features/accounts/queries';

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferRequest) => createTransfer(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.all });
      const previousAccounts = queryClient.getQueryData(accountKeys.lists());
      return { previousAccounts };
    },

    onError: (_error, _payload, context) => {
      if (context?.previousAccounts != null) {
        queryClient.setQueryData(accountKeys.lists(), context.previousAccounts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
