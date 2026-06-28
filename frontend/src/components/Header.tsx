import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './theme-provider';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop, Languages, LogOut, User, Loader2 } from 'lucide-react';

export function Header() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setIsLoggingOut(false);
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-sidebar-border/50 bg-sidebar text-sidebar-foreground px-4 md:px-5 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground" />
      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg">
              <Languages className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 border-border bg-popover/90 backdrop-blur-md">
            <DropdownMenuItem
              onClick={() => changeLanguage('tr')}
              className={`flex items-center justify-between cursor-pointer ${
                i18n.language === 'tr' ? 'bg-accent text-accent-foreground font-semibold' : ''
              }`}
            >
              <span>Türkçe</span>
              <span className="text-[10px] text-muted-foreground">TR</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeLanguage('en')}
              className={`flex items-center justify-between cursor-pointer ${
                i18n.language === 'en' ? 'bg-accent text-accent-foreground font-semibold' : ''
              }`}
            >
              <span>English</span>
              <span className="text-[10px] text-muted-foreground">EN</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle (Dropdown Menu) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-indigo-500" />
              ) : theme === 'light' ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Laptop className="h-5 w-5 text-slate-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 border-border bg-popover/90 backdrop-blur-md">
            <DropdownMenuItem
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 cursor-pointer ${
                theme === 'light' ? 'bg-accent text-accent-foreground font-semibold' : ''
              }`}
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>{t('header.theme_light')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 cursor-pointer ${
                theme === 'dark' ? 'bg-accent text-accent-foreground font-semibold' : ''
              }`}
            >
              <Moon className="h-4 w-4 text-indigo-500" />
              <span>{t('header.theme_dark')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme('system')}
              className={`flex items-center gap-2 cursor-pointer ${
                theme === 'system' ? 'bg-accent text-accent-foreground font-semibold' : ''
              }`}
            >
              <Laptop className="h-4 w-4 text-slate-500" />
              <span>{t('header.theme_system')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" alt={user?.name || ''} />
                <AvatarFallback className="bg-indigo-600/10 text-indigo-500 font-semibold text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-popover/90 backdrop-blur-md">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-foreground">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <User className="h-4 w-4" />
              <span>{t('header.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('dashboard.logging_out')}</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>{t('header.logout')}</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
