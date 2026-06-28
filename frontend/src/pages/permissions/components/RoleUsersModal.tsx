import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { roleService } from '@/services/roleService';
import { X, User as UserIcon, Mail, Loader2, Search } from 'lucide-react';

interface RoleUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number | null;
  roleName: string | null;
}

export default function RoleUsersModal({ isOpen, onClose, roleId, roleName }: RoleUsersModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: roleData, isLoading } = useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => (roleId ? roleService.getRole(roleId) : null),
    enabled: isOpen && roleId !== null,
  });

  if (!isOpen || !roleName) return null;

  const users = roleData?.users || [];

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSearchQuery('');
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
    >
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-md font-bold text-foreground">
            {t('permissions.role_users_title', { name: roleName })}
          </h2>
          <button 
            onClick={() => {
              setSearchQuery('');
              onClose();
            }} 
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border bg-muted/10 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/20 border-border focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Bu role sahip kullanıcı bulunamadı.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <UserIcon className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {user.name} {user.surname}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 shrink-0" />
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              onClose();
            }}
            className="cursor-pointer"
          >
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
