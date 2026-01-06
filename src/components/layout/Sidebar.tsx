import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Package,
  Fuel,
  Wrench,
  Boxes,
  DollarSign,
  Settings,
  Bell,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'vehicles', icon: Truck, path: '/vehicles' },
  { key: 'drivers', icon: Users, path: '/drivers' },
  { key: 'liveMap', icon: MapPin, path: '/live-map' },
  { key: 'missions', icon: Package, path: '/missions' },
  { key: 'fuel', icon: Fuel, path: '/fuel' },
  { key: 'maintenance', icon: Wrench, path: '/maintenance' },
  { key: 'stock', icon: Boxes, path: '/stock' },
  { key: 'finance', icon: DollarSign, path: '/finance' },
  { key: 'reports', icon: FileText, path: '/reports' },
  { key: 'alerts', icon: Bell, path: '/alerts', badge: 4 },
  { key: 'settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  return (
    <aside
      className={cn(
        'fixed top-0 h-screen w-64 bg-sidebar border-sidebar-border flex flex-col z-50',
        isRTL ? 'right-0 border-l' : 'left-0 border-r'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">FleetPro</h1>
            <p className="text-[10px] text-sidebar-muted uppercase tracking-wider">Maroc</p>
          </div>
        </div>
      </div>

      {/* Company Selector */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">TM</span>
            </div>
            <div className={cn('text-left', isRTL && 'text-right')}>
              <p className="text-sm font-medium text-sidebar-foreground">Trans Maroc SARL</p>
              <p className="text-xs text-sidebar-muted">6 véhicules</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-sidebar-muted" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'nav-item relative',
                    isActive && 'nav-item-active'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{t(`nav.${item.key}`)}</span>
                  {item.badge && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary',
                        isRTL ? '-left-3' : '-right-3'
                      )}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <span className="text-xs font-bold text-white">MA</span>
          </div>
          <div className={cn('flex-1', isRTL && 'text-right')}>
            <p className="text-sm font-medium text-sidebar-foreground">Mohamed Admin</p>
            <p className="text-xs text-sidebar-muted">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
