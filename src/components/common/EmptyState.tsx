interface EmptyStateProps {
  message: string;
  icon?: string;
}

export default function EmptyState({ message, icon = '📭' }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      <p>{message}</p>
    </div>
  );
}
