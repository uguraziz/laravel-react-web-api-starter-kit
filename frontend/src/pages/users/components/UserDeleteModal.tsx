import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import type { User } from '@/types';
import { useToastStore } from '@/store/useToastStore';

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDeleteModal({ isOpen, onClose, user }: UserDeleteModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToastStore((state) => state.toast);

  const deleteMutation = useMutation({
    mutationFn: () => userService.deleteUser(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        type: 'success',
        title: t('users.messages.success_title'),
        message: t('users.messages.delete_success'),
      });
      onClose();
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: t('users.messages.error_title'),
        message: err.response?.data?.message || t('login.error_unexpected'),
      });
    }
  });

  if (!isOpen || !user) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
    >
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {t('users.table.confirm_delete_title')}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('users.table.confirm_delete_desc', { name: user.name, surname: user.surname })}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            {t('users.table.cancel')}
          </Button>
          <Button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer animate-in fade-in"
          >
            {deleteMutation.isPending ? t('users.table.loading') : t('users.delete_user')}
          </Button>
        </div>
      </div>
    </div>
  );
}
