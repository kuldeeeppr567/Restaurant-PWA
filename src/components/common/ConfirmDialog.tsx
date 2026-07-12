interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmClass =
    variant === 'danger'
      ? 'btn btn-danger btn-lg'
      : variant === 'warning'
        ? 'btn btn-primary btn-lg'
        : 'btn btn-primary btn-lg';

  return (
    <div
      className={`modal-overlay confirm-dialog ${variant}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className="modal">
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClass}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
