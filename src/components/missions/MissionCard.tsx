import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  Package, 
  Weight,
  ArrowRight,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mission, mockVehicles, mockDrivers } from '@/lib/mock-data';
import { useTranslation } from 'react-i18next';

interface MissionCardProps {
  mission: Mission;
  onView?: (mission: Mission) => void;
  onEdit?: (mission: Mission) => void;
  onStatusChange?: (mission: Mission, status: Mission['status']) => void;
}

export function MissionCard({ mission, onView, onEdit, onStatusChange }: MissionCardProps) {
  const { t } = useTranslation();
  
  const vehicle = mockVehicles.find(v => v.id === mission.vehicleId);
  const driver = mockDrivers.find(d => d.id === mission.driverId);

  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const getStatusLabel = (status: Mission['status']) => {
    switch (status) {
      case 'draft': return t('missions.draft');
      case 'planned': return t('missions.planned');
      case 'in_progress': return t('missions.inProgress');
      case 'delivered': return t('missions.delivered');
      case 'cancelled': return t('missions.cancelled');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(t('common.dateLocale') || 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(t('common.dateLocale') || 'fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-semibold text-primary">
                {mission.reference}
              </span>
              <Badge className={getStatusColor(mission.status)}>
                {getStatusLabel(mission.status)}
              </Badge>
            </div>
            <p className="font-medium text-foreground">{mission.client}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(mission)}>
                <Eye className="h-4 w-4 mr-2" />
                {t('missions.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(mission)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit')}
              </DropdownMenuItem>
              {mission.status === 'in_progress' && (
                <DropdownMenuItem onClick={() => onStatusChange?.(mission, 'delivered')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                  {t('missions.markAsDelivered')}
                </DropdownMenuItem>
              )}
              {mission.status !== 'cancelled' && mission.status !== 'delivered' && (
                <DropdownMenuItem onClick={() => onStatusChange?.(mission, 'cancelled')}>
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  {t('common.cancel')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-muted/50 rounded-lg">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium truncate">{mission.origin}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          <MapPin className="h-4 w-4 text-red-500 shrink-0" />
          <span className="font-medium truncate">{mission.destination}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <div>
              <p className="text-xs text-muted-foreground">Départ</p>
              <p className="text-foreground font-medium">
                {formatDate(mission.departureDate)} à {formatTime(mission.departureDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <div>
              <p className="text-xs text-muted-foreground">Arrivée est.</p>
              <p className="text-foreground font-medium">
                {formatTime(mission.estimatedArrival)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-3" />

        {/* Assignment & Cargo */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <span className="truncate">{vehicle?.plate || 'Non assigné'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="truncate">{driver?.name || 'Non assigné'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="truncate text-muted-foreground">{mission.cargo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{mission.weight.toLocaleString('fr-FR')} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
