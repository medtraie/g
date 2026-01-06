import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertTriangle, Truck, Navigation2, Locate } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { mockVehicles, mockAlerts } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import FleetMap from '@/components/map/FleetMap';
import { Badge } from '@/components/ui/badge';

export default function LiveMap() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();

  const activeVehicles = mockVehicles.filter((v) => v.status === 'active' && v.lastPosition);
  const liveAlerts = mockAlerts.filter(a => !a.acknowledged && ['speed', 'geofence', 'disconnect'].includes(a.type));

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex gap-4">
        {/* Map Area */}
        <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden relative">
          <FleetMap 
            vehicles={mockVehicles.filter(v => v.lastPosition)} 
            selectedVehicleId={selectedVehicleId}
            onVehicleSelect={handleVehicleClick}
          />

          {/* Live indicator */}
          <div className={cn('absolute top-4 flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur rounded-full shadow-lg z-10', isRTL ? 'right-4' : 'left-4')}>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-foreground">{t('liveMap.live')}</span>
            <span className="text-xs text-muted-foreground">• {t('liveMap.activeVehiclesCount', { count: activeVehicles.length })}</span>
          </div>

          {/* Legend */}
          <div className={cn('absolute bottom-4 flex items-center gap-4 px-4 py-2 bg-card/90 backdrop-blur rounded-full shadow-lg z-10', isRTL ? 'right-4' : 'left-4')}>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">{t('liveMap.legend.active')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">{t('liveMap.legend.maintenance')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">{t('liveMap.legend.inactive')}</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Vehicle List */}
        <div className={cn('w-80 bg-card rounded-xl border border-border flex flex-col', isRTL && 'order-first')}>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {t('liveMap.vehiclesOnline')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('liveMap.activeVehiclesCount', { count: activeVehicles.length })}
            </p>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {activeVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  selectedVehicleId === vehicle.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{vehicle.plate}</span>
                  <span className="flex items-center gap-1 text-xs text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    {t('liveMap.online')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.lastPosition?.city}</span>
                </div>
                {vehicle.driver && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary">
                        {vehicle.driver.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <span>{vehicle.driver}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Alerts Summary */}
          {liveAlerts.length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t('liveMap.alertsActive', { count: liveAlerts.length })}</p>
                  <p className="text-xs opacity-80 truncate">
                    {liveAlerts.map(a => t(`alerts.${a.type}`)).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
