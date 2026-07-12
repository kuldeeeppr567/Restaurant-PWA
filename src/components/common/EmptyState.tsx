import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export default function EmptyState({ message, icon = <Inbox className="empty-icon" /> }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {typeof icon === 'string' ? <span className="empty-icon">{icon}</span> : icon}
      <p>{message}</p>
    </div>
  );
}
