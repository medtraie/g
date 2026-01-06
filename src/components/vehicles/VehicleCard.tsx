import { Vehicle } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VehicleCardProps {
  vehicle: Vehicle;
  compact?: boolean;
  onViewDetails?: (vehicle: Vehicle) => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (vehicle: Vehicle) => void;
}

const statusClasses = {
  active: 'status-badge status-active',
  inactive: 'status-badge status-inactive',
  maintenance: 'status-badge status-warning',
};

const typeIcons = {
  truck: '🚛',
  van: '🚐',
  car: '🚗',
};

export function VehicleCard({
  vehicle,
  compact = false,
  onViewDetails,
  onEditVehicle,
  onDeleteVehicle,
}: VehicleCardProps) {
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    const locale = t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA';
    return new Intl.NumberFormat(locale).format(num);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
          {typeIcons[vehicle.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{vehicle.plate}</p>
          <p className="text-xs text-muted-foreground truncate">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
        <span className={statusClasses[vehicle.status]}>
          {t(`vehicles.${vehicle.status}`)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
            {typeIcons[vehicle.type]}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{vehicle.plate}</h3>
            <p className="text-sm text-muted-foreground">
              {vehicle.brand} {vehicle.model}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails?.(vehicle)}>
              {t('vehicles.details')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditVehicle?.(vehicle)}>
              {t('vehicles.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem>{t('vehicles.documents')}</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDeleteVehicle?.(vehicle)}
            >
              {t('vehicles.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={statusClasses[vehicle.status]}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              vehicle.status === 'active' && 'bg-success',
              vehicle.status === 'inactive' && 'bg-muted-foreground',
              vehicle.status === 'maintenance' && 'bg-warning'
            )} />
            {t(`vehicles.${vehicle.status}`)}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatNumber(vehicle.mileage)} {t('common.km')}
          </span>
        </div>

        {vehicle.driver && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">
                {vehicle.driver.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <span>{vehicle.driver}</span>
          </div>
        )}

        {vehicle.lastPosition && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{vehicle.lastPosition.city}</span>
            {vehicle.status === 'active' && (
              <span className="flex items-center gap-1 text-xs text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                {t('vehicles.live')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Document alerts */}
      {(!vehicle.documents.technicalVisit.valid || !vehicle.documents.insurance.valid) && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-warning flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            {!vehicle.documents.technicalVisit.valid
              ? t('vehicles.technicalVisitToRenew')
              : t('vehicles.insuranceToRenew')}
          </p>
        </div>
      )}
    </div>
  );
}
