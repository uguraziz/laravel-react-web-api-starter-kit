import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { permissionService } from '@/services/permissionService';
import { roleService } from '@/services/roleService';
import { useToastStore } from '@/store/useToastStore';
import { X, Loader2, Shield } from 'lucide-react';

interface RoleToEdit {
  id: number;
  name: string;
  permissions: string[];
}

interface PermissionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: RoleToEdit | null;
}

export default function PermissionCreateModal({ isOpen, onClose, roleToEdit }: PermissionCreateModalProps) {
  const { t } = useTranslation();
  const { toast } = useToastStore();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionService.getPermissions,
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: { name: string; permissions: string[] }) => {
      if (roleToEdit) {
        return roleService.updateRole(roleToEdit.id, data);
      }
      return roleService.createRole(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        type: 'success',
        title: t('users.messages.success_title'),
        message: roleToEdit
          ? 'Yetki rolü başarıyla güncellendi.'
          : 'Yetki rolü başarıyla oluşturuldu.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: t('users.messages.error_title'),
        message: error.response?.data?.message || 'İşlem gerçekleştirilirken bir hata oluştu.',
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (roleToEdit) {
        setName(roleToEdit.name);
        setSelectedPermissions(roleToEdit.permissions);
      } else {
        setName('');
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, roleToEdit]);

  if (!isOpen) return null;

  const handleCheckboxChange = (permissionName: string, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked
        ? [...prev, permissionName]
        : prev.filter((n) => n !== permissionName)
    );
  };

  const renderCheckbox = (permissionName: string, labelKey: string) => {
    const isChecked = selectedPermissions.includes(permissionName);
    return (
      <div className="flex items-center gap-2 py-1 px-2.5 rounded-md hover:bg-muted/40 transition-colors group cursor-pointer border border-transparent hover:border-border shrink-0">
        <Checkbox
          id={permissionName}
          checked={isChecked}
          onCheckedChange={(checked) => handleCheckboxChange(permissionName, !!checked)}
          className="border-muted-foreground/40 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 h-4 w-4 rounded-sm transition-all cursor-pointer"
        />
        <Label
          htmlFor={permissionName}
          className="text-xs font-semibold text-foreground cursor-pointer select-none group-hover:text-indigo-500 transition-colors"
        >
          {t(labelKey)}
        </Label>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        type: 'error',
        title: t('users.messages.error_title'),
        message: 'Lütfen yetki/rol adını giriniz.',
      });
      return;
    }

    mutation.mutate({
      name,
      permissions: selectedPermissions,
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
    >
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-foreground">
              {roleToEdit ? t('permissions.edit_role') : t('permissions.create_modal_title')}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto max-h-[50vh] sm:max-h-[55vh] p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role-name" className="text-sm font-semibold text-foreground">
                {t('permissions.name')}
              </Label>
              <Input
                id="role-name"
                type="text"
                placeholder={t('permissions.name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-muted/20 border-border focus-visible:ring-indigo-500 text-sm h-10"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                {t('users.permissions')}
              </Label>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="border border-border rounded-lg p-2 bg-muted/10">
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="dashboard" className="border-b border-border">
                      <AccordionTrigger className="text-sm font-semibold py-3 px-4 hover:bg-muted/50 hover:no-underline rounded-lg transition-all duration-200">
                        {t('permissions.groups.dashboard')}
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 px-4 flex flex-wrap gap-2 items-center h-auto">
                        {renderCheckbox('dashboard.show', 'permissions.actions.show')}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="user_management" className="border-none mt-1">
                      <AccordionTrigger className="text-sm font-semibold py-3 px-4 hover:bg-muted/50 hover:no-underline rounded-lg transition-all duration-200">
                        {t('permissions.groups.user_management')}
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 px-2 h-auto">
                        <Accordion type="multiple" className="w-full pl-4 border-l border-border/80 space-y-2">
                          <AccordionItem value="user" className="border-none">
                            <AccordionTrigger className="text-xs font-semibold py-2.5 px-3 hover:bg-muted/30 hover:no-underline rounded-md transition-all duration-200">
                              {t('permissions.groups.user')}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-3 px-2 flex flex-wrap gap-2 items-center h-auto">
                              {renderCheckbox('user.user.show', 'permissions.actions.show')}
                              {renderCheckbox('user.user.create', 'permissions.actions.create')}
                              {renderCheckbox('user.user.update', 'permissions.actions.update')}
                              {renderCheckbox('user.user.delete', 'permissions.actions.delete')}
                              {renderCheckbox('user.user.status', 'permissions.actions.status')}
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="permission" className="border-none">
                            <AccordionTrigger className="text-xs font-semibold py-2.5 px-3 hover:bg-muted/30 hover:no-underline rounded-md transition-all duration-200">
                              {t('permissions.groups.permission')}
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-3 px-2 flex flex-wrap gap-2 items-center h-auto">
                              {renderCheckbox('user.permission.show', 'permissions.actions.show')}
                              {renderCheckbox('user.permission.create', 'permissions.actions.create')}
                              {renderCheckbox('user.permission.update', 'permissions.actions.update')}
                              {renderCheckbox('user.permission.delete', 'permissions.actions.delete')}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
              className="cursor-pointer"
            >
              {t('permissions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md hover:shadow-indigo-500/10 transition-all flex items-center gap-2"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('permissions.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
