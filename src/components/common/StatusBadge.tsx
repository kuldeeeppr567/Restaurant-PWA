interface StatusBadgeProps {
  status: string;
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const cssClass = status.replace(/_/g, '-').toLowerCase();

  return (
    <span className={`status-badge ${cssClass}`}>
      {label}
    </span>
  );
}
