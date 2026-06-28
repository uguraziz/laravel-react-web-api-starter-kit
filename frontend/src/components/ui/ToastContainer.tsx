import { useToastStore, type ToastMessage } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-indigo-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-emerald-500';
      case 'error':
        return 'border-l-4 border-l-rose-500';
      case 'info':
        return 'border-l-4 border-l-indigo-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-card/90 border border-border/80 shadow-2xl rounded-xl p-4 flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right duration-300 ${getBorderColor(
            toast.type
          )}`}
        >
          {renderIcon(toast.type)}
          
          <div className="flex-1 space-y-0.5">
            {toast.title && (
              <h4 className="text-sm font-semibold text-foreground">
                {toast.title}
              </h4>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-line">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0 p-0.5 rounded-md hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
