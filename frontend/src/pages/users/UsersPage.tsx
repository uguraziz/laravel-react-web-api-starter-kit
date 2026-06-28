import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone,
  User as UserIcon,
  Calendar,
  MoreVertical,
  Edit2,
  Trash,
  Shield,
  Filter,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types';
import PermissionGuard from '@/components/PermissionGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Modals
import UserCreateModal from './components/UserCreateModal';
import UserEditModal from './components/UserEditModal';
import UserDeleteModal from './components/UserDeleteModal';
import UserRoleModal from './components/UserRoleModal';

export default function UsersPage() {
  const { t } = useTranslation();
  
  // State for query params
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'passive' | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [sort, setSort] = useState<string>('-created_at');
  const [roleFilter, setRoleFilter] = useState('');
  const [debouncedRoleFilter, setDebouncedRoleFilter] = useState('');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const { user: currentUser } = useAuthStore();

  const hasShowPermission = currentUser?.permissions?.includes('user.user.show') ?? false;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRoleFilter(roleFilter);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [roleFilter]);

  // Fetch users query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, perPage, debouncedSearch, status, gender, sort, debouncedRoleFilter],
    queryFn: () => userService.getUsers({
      page,
      per_page: perPage,
      'filter[search]': debouncedSearch || undefined,
      'filter[status]': status || undefined,
      'filter[gender]': gender || undefined,
      'filter[role]': debouncedRoleFilter || undefined,
      sort: sort || undefined,
    }),
    enabled: hasShowPermission,
    retry: false,
  });

  const users = data?.data || [];
  const meta = data?.meta;

  const handleSort = (field: string) => {
    if (sort === field) {
      setSort(`-${field}`);
    } else {
      setSort(field);
    }
    setPage(1);
  };

  const renderStatusBadge = (userStatus: 'active' | 'passive') => {
    switch (userStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <UserCheck className="h-3.5 w-3.5" />
            {t('users.table.status_active')}
          </span>
        );
      case 'passive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <UserX className="h-3.5 w-3.5" />
            {t('users.table.status_passive')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <PermissionGuard permission="user.user.show">
      <div className="space-y-6">
        <PageHeader
          title={t('users.title_short')}
          action={
            <div className="flex items-center gap-2">
              {currentUser?.permissions?.includes('user.permission.show') && (
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 shrink-0 border-border text-foreground hover:bg-muted"
                >
                  <Link to="/users/permissions">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {t('users.permissions')}
                  </Link>
                </Button>
              )}
              {currentUser?.permissions?.includes('user.user.create') && (
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 shrink-0 shadow-md hover:shadow-indigo-500/10"
                >
                  <Plus className="h-4 w-4" />
                  {t('users.add_user')}
                </Button>
              )}
            </div>
          }
        />

        {/* Filters & Actions Panel */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="py-4 px-6 border-b border-border">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-indigo-500" /> 
                {t('users.title')}
              </CardTitle>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('users.table.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-sm w-full bg-muted/20 border-border focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as any);
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-border bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">{t('users.table.all_statuses')}</option>
                  <option value="active">{t('users.table.status_active')}</option>
                  <option value="passive">{t('users.table.status_passive')}</option>
                </select>

                {/* Gender Filter */}
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value as any);
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-border bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">{t('users.table.all_genders')}</option>
                  <option value="male">{t('users.table.gender_male')}</option>
                  <option value="female">{t('users.table.gender_female')}</option>
                </select>

                {/* Page Length Filter */}
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-md border border-border bg-card text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </CardHeader>
          
          {/* Table Content */}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th 
                      onClick={() => handleSort('name')} 
                      className="py-2.5 px-4 cursor-pointer select-none hover:text-indigo-500 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {t('users.table.name')}
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-2.5 px-4">{t('users.table.surname')}</th>
                    <th className="py-2.5 px-4">{t('users.table.email')}</th>
                    <th className="py-2.5 px-4">{t('users.table.phone')}</th>
                    <th className="py-2.5 px-4">{t('users.table.gender')}</th>
                    <th className="py-2.5 px-4">{t('users.table.status')}</th>
                    <th className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5 justify-start">
                        {t('users.table.role')}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="hover:bg-muted/50 p-1 rounded-sm cursor-pointer transition-colors text-muted-foreground hover:text-indigo-500 flex items-center justify-center">
                              <Filter className={`h-3.5 w-3.5 ${roleFilter ? 'text-indigo-500 fill-indigo-500/10' : ''}`} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2.5 bg-card border border-border rounded-lg shadow-md" align="start">
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder={t('users.table.role_filter_placeholder')}
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="h-8 text-xs bg-muted/20 border-border focus-visible:ring-indigo-500 pr-7"
                              />
                                {roleFilter && (
                                  <button
                                    onClick={() => setRoleFilter('')}
                                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                    </th>
                    <th 
                      onClick={() => handleSort('created_at')} 
                      className="py-2.5 px-4 cursor-pointer select-none hover:text-indigo-500 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {t('users.table.created_at')}
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-2.5 px-4 text-right">{t('users.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="py-2 px-4"><Skeleton className="h-5 w-24 rounded" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-5 w-24 rounded" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-5 w-40 rounded" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-5 w-28 rounded" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-5 w-16 rounded" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-7 w-24 rounded-full" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-7 w-24 rounded-full" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-5 w-24 rounded" /></td>
                        <td className="py-2 px-4"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></td>
                      </tr>
                    ))
                  ) : isError ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-rose-500 font-medium">
                        Error loading users list. Please try again later.
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground font-medium">
                        {t('users.table.no_records')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr 
                        key={user.id} 
                        className="hover:bg-muted/30 transition-all duration-200 group"
                      >
                        {/* Name */}
                        <td className="py-2 px-4 font-semibold text-foreground">
                          {user.name}
                        </td>

                        {/* Surname */}
                        <td className="py-2 px-4 font-semibold text-foreground">
                          {user.surname}
                        </td>
                        
                        {/* Email */}
                        <td className="py-2 px-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                            {user.email}
                          </div>
                        </td>
                        
                        {/* Phone */}
                        <td className="py-2 px-4 text-muted-foreground">
                          {user.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground/40">-</span>
                          )}
                        </td>
                        
                        {/* Gender */}
                        <td className="py-2 px-4 text-muted-foreground capitalize">
                          {user.gender ? (
                            <div className="flex items-center gap-1.5">
                              <UserIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {t(`users.table.gender_${user.gender}` as any)}
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground/40">-</span>
                          )}
                        </td>
                        
                        {/* Status */}
                        <td className="py-2 px-4">
                          {renderStatusBadge(user.status as any)}
                        </td>

                        {/* Role */}
                        <td className="py-2 px-4">
                          {currentUser?.permissions?.includes('user.user.update') ? (
                            <button
                              onClick={() => {
                                setSelectedUserForRole(user);
                                setIsRoleOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer transition-all max-w-[150px] truncate"
                            >
                              <Shield className="h-3.5 w-3.5" />
                              {user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'Rol Yok'}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border max-w-[150px] truncate">
                              <Shield className="h-3.5 w-3.5" />
                              {user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'Rol Yok'}
                            </span>
                          )}
                        </td>
                        
                        {/* Created At */}
                        <td className="py-2 px-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-4 text-right">
                          {(currentUser?.permissions?.includes('user.user.update') || 
                            currentUser?.permissions?.includes('user.user.delete')) ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-muted focus-visible:ring-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 bg-card border border-border">
                                {currentUser?.permissions?.includes('user.user.update') && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditOpen(true);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Edit2 className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                                    {t('users.edit')}
                                  </DropdownMenuItem>
                                )}
                                {currentUser?.permissions?.includes('user.user.delete') && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteOpen(true);
                                    }}
                                    variant="destructive"
                                    className="cursor-pointer"
                                  >
                                    <Trash className="h-3.5 w-3.5 mr-2 text-rose-500" />
                                    {t('users.delete')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="italic text-muted-foreground/30 text-xs">Yetki Yok</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {meta && meta.last_page > 1 && (
              <div className="py-4 px-6 border-t border-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/10">
                <span className="text-sm text-muted-foreground text-center sm:text-left">
                  {t('users.table.pagination.showing', {
                    from: meta.from || 0,
                    to: meta.to || 0,
                    total: meta.total
                  })}
                </span>
                
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="h-8 px-2.5"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('users.table.pagination.previous')}
                  </Button>
                  
                  {Array.from({ length: meta.last_page }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 p-0 ${page === pageNum ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === meta.last_page}
                    onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
                    className="h-8 px-2.5"
                  >
                    {t('users.table.pagination.next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <UserCreateModal 
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        <UserEditModal 
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />

        <UserDeleteModal 
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />

        <UserRoleModal
          isOpen={isRoleOpen}
          onClose={() => {
            setIsRoleOpen(false);
            setSelectedUserForRole(null);
          }}
          user={selectedUserForRole}
        />
      </div>
    </PermissionGuard>
  );
}
