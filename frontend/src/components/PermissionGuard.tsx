import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const hasPermission = user?.permissions?.includes(permission) ?? false;

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-row items-start gap-4 p-5 text-left border border-amber-500/20 bg-amber-500/5 rounded-xl shadow-xs max-w-2xl mx-0 my-6 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
        <ShieldAlert className="h-5 w-5 text-amber-500" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-foreground">
          {t('permissions.access_denied_title') || 'Erişim Yetkisi Yok'}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('permissions.access_denied_desc') || 'Bu sayfayı görüntüleme yetkiniz bulunmamaktadır. Lütfen sistem yöneticinizle iletişime geçin.'}
        </p>
      </div>
    </div>
  );
}
