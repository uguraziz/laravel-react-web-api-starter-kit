import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { User } from '@/types';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserEditModal({ isOpen, onClose, user }: UserEditModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToastStore((state) => state.toast);
  const { user: currentUser } = useAuthStore();

  const hasStatusPermission = currentUser?.permissions?.includes('user.user.status') ?? false;

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    gender: 'male',
    status: 'active',
    address: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: '',
        phone: user.phone || '',
        gender: user.gender || 'male',
        status: user.status as any,
        address: user.address || '',
      });
      setError(null);
    }
  }, [user]);

  const editMutation = useMutation({
    mutationFn: (data: any) => userService.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        type: 'success',
        title: t('users.messages.success_title'),
        message: t('users.messages.edit_success'),
      });
      onClose();
      setError(null);
    },
    onError: (err: any) => {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        const errorMessages = Object.values(responseData.errors)
          .flat()
          .join('\n');
        setError(errorMessages);
        
        toast({
          type: 'error',
          title: t('users.messages.error_title'),
          message: responseData.message || t('login.error_unexpected'),
        });
      } else {
        const errorMsg = responseData?.message || t('login.error_unexpected');
        setError(errorMsg);
        
        toast({
          type: 'error',
          title: t('users.messages.error_title'),
          message: errorMsg,
        });
      }
    }
  });

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.password) {
      delete (submitData as any).password;
    }
    editMutation.mutate(submitData);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
    >
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{t('users.edit_user')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-sm font-medium whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.name')}</label>
              <Input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-muted/10 border-border focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.surname')}</label>
              <Input
                required
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="bg-muted/10 border-border focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.email')}</label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-muted/10 border-border focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.password')}</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-muted/10 border-border focus-visible:ring-indigo-500"
            />
            <p className="text-xs text-muted-foreground">{t('users.table.password_help')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.phone')}</label>
              <Input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-muted/10 border-border focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.gender')}</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="male">{t('users.table.gender_male')}</option>
                <option value="female">{t('users.table.gender_female')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.status')}</label>
              <select
                disabled={!hasStatusPermission}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-9 rounded-md border border-border bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="active">{t('users.table.status_active')}</option>
                <option value="passive">{t('users.table.status_passive')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('users.table.address')}</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-md border border-border bg-card text-foreground p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              {t('users.table.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={editMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              {editMutation.isPending ? t('users.table.loading') : t('users.table.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
