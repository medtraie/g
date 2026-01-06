import { Phone, Award, Car, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Driver, mockVehicles } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface DriverCardProps {
  driver: Driver;
  isRTL?: boolean;
  onEdit?: (driver: Driver) => void;
  onDisable?: (driver: Driver) => void;
}

export function DriverCard({ driver, isRTL, onEdit, onDisable }: DriverCardProps) {
  const { t } = useTranslation();

  const vehicle = driver.vehicleId 
    ? mockVehicles.find(v => v.id === driver.vehicleId) 
    : null;

  const statusConfig = {
    available: { label: t('drivers.available'), color: 'bg-success text-success-foreground' },
    on_mission: { label: t('drivers.on_mission'), color: 'bg-info text-info-foreground' },
    off_duty: { label: t('drivers.off_duty'), color: 'bg-muted text-muted-foreground' },
  };

  const status = statusConfig[driver.status];
  const licenseExpiry = new Date(driver.licenseExpiry);
  const isLicenseExpiringSoon = licenseExpiry.getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const formatDate = (date: Date) => {
    const locale = t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA';
    return date.toLocaleDateString(locale);
  };

  return (
    <div className="group bg-card rounded-xl border border-border p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {getInitials(driver.name)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {driver.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span dir="ltr">{driver.phone}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
            <DropdownMenuItem>{t('drivers.viewProfile')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(driver)}>
              {t('drivers.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem>{t('drivers.missionsHistory')}</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDisable?.(driver)}
            >
              {t('drivers.disable')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={cn('font-medium', status.color)}>
          {status.label}
        </Badge>
        <div className={cn('flex items-center gap-1 font-semibold', getScoreColor(driver.score))}>
          <Award className="w-4 h-4" />
          <span>{driver.score}/100</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Car className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t('drivers.vehicle')}:</span>
          {vehicle ? (
            <span className="font-medium text-foreground">{vehicle.plate}</span>
          ) : (
            <span className="text-muted-foreground italic">{t('drivers.unassigned')}</span>
          )}
        </div>

        <div className={cn(
          'flex items-center justify-between p-2 rounded-lg',
          isLicenseExpiringSoon ? 'bg-warning/10' : 'bg-muted/50'
        )}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('drivers.licenseLabel', { license: driver.license })}
            </span>
          </div>
          <span className={cn(
            'font-medium',
            isLicenseExpiringSoon ? 'text-warning' : 'text-foreground'
          )}>
            {formatDate(licenseExpiry)}
          </span>
        </div>
      </div>
    </div>
  );
}
