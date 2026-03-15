// src/components/ui/confirmation-dialog.tsx
import { useEffect, useRef } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Always render the dialog element so the ref is stable.
  // The native <dialog> is hidden by default until showModal() is called.
  return (
    <dialog
      ref={dialogRef}
      className="rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50"
      onClose={onCancel}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
}
