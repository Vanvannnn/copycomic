import { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'success' | 'error' | 'chaos';
}

/** Zone de notifications annoncée aux lecteurs d'écran. */
export function ToastArea({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toast-area" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4200);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);
  return (
    <div className={`toast toast-${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
      <span>{toast.text}</span>
      <button type="button" className="icon-btn small" onClick={() => onDismiss(toast.id)} aria-label="Masquer la notification">
        ✕
      </button>
    </div>
  );
}
