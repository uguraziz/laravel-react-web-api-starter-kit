import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Shield, Edit2, Trash, Loader2 } from 'lucide-react';
import PermissionCreateModal from './components/PermissionCreateModal';
import RoleUsersModal from './components/RoleUsersModal';
import { roleService } from '@/services/roleService';
import { useToastStore } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Role } from '@/types';
import PermissionGuard from '@/components/PermissionGuard';

export default function PermissionsPage() {
  const { t } = useTranslation();
  const { toast } = useToastStore();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const hasPermission = currentUser?.permissions?.includes('user.permission.show') ?? false;

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles,
    enabled: hasPermission,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        type: 'success',
        title: t('users.messages.success_title'),
        message: 'Rol başarıyla silindi.',
      });
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: t('users.messages.error_title'),
        message: error.response?.data?.message || 'Rol silinirken bir hata oluştu.',
      });
    },
  });

  const handleDeleteRole = (id: number, name: string) => {
    const confirm = window.confirm(t('permissions.confirm_delete_desc', { name }));
    if (confirm) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <PermissionGuard permission="user.permission.show">
      <div className="space-y-6">
        <PageHeader 
          title={t('permissions.title')}
          backUrl="/users"
          action={
            currentUser?.permissions?.includes('user.permission.create') ? (
              <Button 
                onClick={() => {
                  setRoleToEdit(null);
                  setIsCreateOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 shrink-0 shadow-md hover:shadow-indigo-500/10"
              >
                <Plus className="h-4 w-4" />
                {t('permissions.add_permission')}
              </Button>
            ) : undefined
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card text-muted-foreground text-sm space-y-2">
            <Shield className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p>Henüz tanımlanmış bir yetki rolü bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {roles.map((role) => {
              return (
                <Card key={role.id} className="border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden rounded-lg">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        {role.name}
                      </span>
                      <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                    <CardTitle className="text-foreground text-sm font-bold mt-1.5 truncate">
                      {role.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="py-4 flex flex-col items-center justify-center border-y border-border/40 bg-muted/5">
                    <button 
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setSelectedRoleName(role.name);
                        setIsUsersOpen(true);
                      }}
                      className="text-center group cursor-pointer focus:outline-none"
                    >
                      <span className="block text-2xl font-extrabold text-foreground group-hover:text-indigo-600 transition-colors leading-none">
                        {role.userCount}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium group-hover:text-indigo-500 transition-colors mt-1 block">
                        {t('permissions.users_count')}
                      </span>
                    </button>
                  </CardContent>
                  
                  {(currentUser?.permissions?.includes('user.permission.update') || 
                    currentUser?.permissions?.includes('user.permission.delete')) && (
                    <CardFooter className="py-2 px-3 flex items-center justify-end gap-1 shrink-0 bg-muted/10">
                      {currentUser?.permissions?.includes('user.permission.update') && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setRoleToEdit(role);
                            setIsCreateOpen(true);
                          }}
                          className="h-7 text-[10px] px-2 cursor-pointer text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          {t('users.edit')}
                        </Button>
                      )}
                      {currentUser?.permissions?.includes('user.permission.delete') && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="h-7 text-[10px] px-2 cursor-pointer text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          {t('users.delete')}
                        </Button>
                      )}
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <PermissionCreateModal 
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setRoleToEdit(null);
          }}
          roleToEdit={roleToEdit}
        />

        <RoleUsersModal
          isOpen={isUsersOpen}
          onClose={() => {
            setIsUsersOpen(false);
            setSelectedRoleId(null);
            setSelectedRoleName(null);
          }}
          roleId={selectedRoleId}
          roleName={selectedRoleName}
        />
      </div>
    </PermissionGuard>
  );
}
