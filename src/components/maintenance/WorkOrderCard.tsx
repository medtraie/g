import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { 
  Wrench, 
  Calendar, 
  Building2,
  DollarSign,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkOrder, mockVehicles } from '@/lib/mock-data';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onView?: (wo: WorkOrder) => void;
  onEdit?: (wo: WorkOrder) => void;
  onComplete?: (wo: WorkOrder) => void;
}

export function WorkOrderCard({ workOrder, onView, onEdit, onComplete }: WorkOrderCardProps) {
  const { t } = useTranslation();
  const vehicle = mockVehicles.find(v => v.id === workOrder.vehicleId);

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{t('maintenance.stats.pending')}</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-1"><Wrench className="h-3 w-3" />{t('maintenance.stats.inProgress')}</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 gap-1"><CheckCircle className="h-3 w-3" />{t('maintenance.stats.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('missions.cancelled')}</Badge>;
    }
  };

  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{t('maintenance.form.priorityHigh')}</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">{t('maintenance.form.priorityMedium')}</Badge>;
      case 'low':
        return <Badge variant="outline">{t('maintenance.form.priorityLow')}</Badge>;
    }
  };

  const getTypeLabel = (type: WorkOrder['type']) => {
    switch (type) {
      case 'preventive': return t('maintenance.form.typePreventive');
      case 'corrective': return t('maintenance.form.typeCorrective');
      case 'inspection': return t('maintenance.form.typeInspection');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(t('common.dateLocale'), { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    const locale = t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA';
    return new Intl.NumberFormat(locale).format(amount) + ' ' + t('common.currency');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-semibold text-primary">
                {workOrder.reference}
              </span>
              {getStatusBadge(workOrder.status)}
            </div>
            <p className="text-sm text-muted-foreground">{getTypeLabel(workOrder.type)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={t('common.dateLocale') === 'ar-MA' ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => onView?.(workOrder)}>
                <Eye className={`h-4 w-4 ${t('common.dateLocale') === 'ar-MA' ? 'ml-2' : 'mr-2'}`} />
                {t('maintenance.card.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(workOrder)}>
                <Edit className={`h-4 w-4 ${t('common.dateLocale') === 'ar-MA' ? 'ml-2' : 'mr-2'}`} />
                {t('maintenance.card.edit')}
              </DropdownMenuItem>
              {workOrder.status === 'in_progress' && (
                <DropdownMenuItem onClick={() => onComplete?.(workOrder)}>
                  <CheckCircle className={`h-4 w-4 ${t('common.dateLocale') === 'ar-MA' ? 'ml-2' : 'mr-2'} text-emerald-600`} />
                  {t('maintenance.card.markCompleted')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Vehicle & Priority */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{vehicle?.plate}</p>
              <p className="text-xs text-muted-foreground">{vehicle?.brand} {vehicle?.model}</p>
            </div>
          </div>
          {getPriorityBadge(workOrder.priority)}
        </div>

        {/* Description */}
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {workOrder.description}
        </p>

        <div className="h-px bg-border my-3" />

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(workOrder.scheduledDate)}</span>
          </div>
          {workOrder.garage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{workOrder.garage}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-border my-3" />

        {/* Costs */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span>{t('maintenance.card.labor')}: {formatCurrency(workOrder.laborCost)}</span>
            <span className="mx-2">|</span>
            <span>{t('maintenance.card.parts')}: {formatCurrency(workOrder.partsCost)}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-primary">
            <DollarSign className="h-4 w-4" />
            {formatCurrency(workOrder.totalCost)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
