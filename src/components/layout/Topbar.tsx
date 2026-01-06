import { useTranslation } from 'react-i18next';
import { Bell, Search, Globe, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function Topbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const stored = window.localStorage.getItem('fleet_theme');
    return stored === 'dark';
  });
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem('fleet_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('fleet_lang', lang);
    }
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
            isRTL ? 'right-3' : 'left-3'
          )} />
          <Input
            type="search"
            placeholder={t('common.search')}
            className={cn('w-full h-10 bg-muted/50 border-0', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Globe className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => toggleLanguage('fr')}>
              <span className="mr-2">🇫🇷</span> Français
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleLanguage('ar')}>
              <span className="mr-2">🇲🇦</span> العربية
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
            4
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {(user?.name || 'MA')
                    .split(' ')
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
            <DropdownMenuItem>{t('user.profile')}</DropdownMenuItem>
            <DropdownMenuItem>{t('user.settings')}</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              {t('user.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
