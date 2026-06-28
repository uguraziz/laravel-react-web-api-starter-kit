import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { roleService } from '@/services/roleService';
import { userService } from '@/services/userService';
import { useToastStore } from '@/store/useToastStore';
import { X, Loader2, Shield } from 'lucide-react';
import type { User } from '@/types';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserRoleModal({ isOpen, onClose, user }: UserRoleModalProps) {
  const { t } = useTranslation();
  const { toast } = useToastStore();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRoles(user.roles || []);
    }
  }, [isOpen, user]);

  const mutation = useMutation({
    mutationFn: (rolesData: string[]) => {
      if (!user) throw new Error('Kullanıcı bulunamadı');
      
      return userService.updateUser(user.id, {
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        status: user.status,
        address: user.address,
        roles: rolesData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        type: 'success',
        title: t('users.messages.success_title'),
        message: 'Kullanıcı rolleri başarıyla güncellendi.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: t('users.messages.error_title'),
        message: error.response?.data?.message || 'Roller güncellenirken bir hata oluştu.',
      });
    },
  });

  if (!isOpen || !user) return null;

  const handleRoleSelect = (value: string) => {
    if (value && !selectedRoles.includes(value)) {
      setSelectedRoles((prev) => [...prev, value]);
    }
  };

  const handleRemoveRole = (roleName: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== roleName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(selectedRoles);
  };

  const availableRoles = roles.filter((role) => !selectedRoles.includes(role.name));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200"
    >
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-500" />
            <h2 className="text-md font-bold text-foreground">
              {user.name} {user.surname} - Rol Yetkileri
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Label className="text-sm font-semibold text-foreground">
              Kullanıcıya atamak istediğiniz rolleri seçin:
            </Label>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <Select onValueChange={handleRoleSelect} value="">
                  <SelectTrigger className="w-full bg-muted/20 border-border h-10 cursor-pointer">
                    <SelectValue placeholder="Rol seçmek için tıklayın..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    {availableRoles.length === 0 ? (
                      <div className="py-2.5 px-3 text-xs text-muted-foreground text-center">
                        Seçilebilecek başka rol yok
                      </div>
                    ) : (
                      availableRoles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.name}
                          className="cursor-pointer hover:bg-muted/50 text-sm py-2"
                        >
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {selectedRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedRoles.map((roleName) => (
                      <span
                        key={roleName}
                        className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/20 animate-in zoom-in-95 duration-100"
                      >
                        {roleName}
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(roleName)}
                          className="hover:bg-indigo-500/20 rounded-full p-0.5 cursor-pointer text-indigo-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
              className="cursor-pointer"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md hover:shadow-indigo-500/10 transition-all flex items-center gap-2"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Değişiklikleri Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
