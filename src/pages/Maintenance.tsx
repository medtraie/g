import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorkOrderCard } from '@/components/maintenance/WorkOrderCard';
import { MaintenancePlanCard } from '@/components/maintenance/MaintenancePlanCard';
import { WorkOrderForm } from '@/components/maintenance/WorkOrderForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  ClipboardList,
  Settings2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  mockWorkOrders, 
  mockMaintenancePlans, 
  mockVehicles, 
  maintenanceCostsByMonth,
  WorkOrder,
  MaintenancePlan 
} from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';

export default function Maintenance() {
  const { t } = useTranslation();
  const [workOrders, setWorkOrders] = usePersistentState<WorkOrder[]>('maintenance_work_orders', mockWorkOrders);
  const [searchQuery, setSearchQuery] = usePersistentState<string>('maintenance_search', '');
  const [statusFilter, setStatusFilter] = usePersistentState<string>('maintenance_status_filter', 'all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | undefined>();
  const [activeTab, setActiveTab] = usePersistentState<string>('maintenance_active_tab', 'orders');

  // Stats
  const stats = {
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    totalCost: workOrders.reduce((acc, wo) => acc + wo.totalCost, 0),
    overdueCount: mockMaintenancePlans.filter(p => p.status === 'overdue').length,
    dueSoonCount: mockMaintenancePlans.filter(p => p.status === 'due_soon').length,
  };

  const filteredWorkOrders = workOrders.filter((wo) => {
    const vehicle = mockVehicles.find(v => v.id === wo.vehicleId);
    const matchesSearch =
      wo.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.plate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (wo: WorkOrder) => {
    setSelectedWorkOrder(wo);
    setFormOpen(true);
  };

  const handleComplete = (wo: WorkOrder) => {
    setWorkOrders(prev =>
      prev.map(w => w.id === wo.id ? { ...w, status: 'completed' as const, completedDate: new Date().toISOString().split('T')[0] } : w)
    );
    toast({ 
      title: t('maintenance.success.completed'), 
      description: t('maintenance.success.markedCompleted', { reference: wo.reference }) 
    });
  };

  const handleFormSubmit = (data: any) => {
    const partsCost = data.parts.reduce((acc: number, p: any) => acc + (p.quantity * p.unitPrice), 0);
    const totalCost = data.laborCost + partsCost;

    if (selectedWorkOrder) {
      setWorkOrders(prev =>
        prev.map(wo =>
          wo.id === selectedWorkOrder.id
            ? { ...wo, ...data, partsCost, totalCost }
            : wo
        )
      );
      toast({ title: t('maintenance.success.updated') });
    } else {
      const newWorkOrder: WorkOrder = {
        id: `wo${Date.now()}`,
        reference: `OT-2024-${String(workOrders.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'pending',
        partsCost,
        totalCost,
      };
      setWorkOrders(prev => [newWorkOrder, ...prev]);
      toast({ 
        title: t('maintenance.success.created'), 
        description: t('maintenance.success.reference', { reference: newWorkOrder.reference }) 
      });
    }
    setSelectedWorkOrder(undefined);
  };

  const handleCreateFromPlan = (plan: MaintenancePlan) => {
    setSelectedWorkOrder(undefined);
    setFormOpen(true);
    // Pre-fill would happen via form reset with plan data
    toast({ 
      title: t('maintenance.success.createFromPlan'), 
      description: t('maintenance.success.forPlan', { name: plan.name }) 
    });
  };

  const openNewForm = () => {
    setSelectedWorkOrder(undefined);
    setFormOpen(true);
  };

  const formatCurrency = (amount: number) => {
    const locale = t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA';
    return new Intl.NumberFormat(locale).format(amount) + ' ' + t('common.currency');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('nav.maintenance')}</h1>
            <p className="text-muted-foreground">{t('maintenance.subtitle')}</p>
          </div>
          <Button onClick={openNewForm} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('maintenance.newOrder')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">{t('maintenance.stats.pending')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Wrench className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">{t('maintenance.stats.inProgress')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">{t('maintenance.stats.completed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overdueCount}</p>
                  <p className="text-xs text-muted-foreground">{t('maintenance.stats.overdue')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.dueSoonCount}</p>
                  <p className="text-xs text-muted-foreground">{t('maintenance.stats.dueSoon')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(stats.totalCost/1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">{t('maintenance.stats.totalCost')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              {t('maintenance.tabs.orders')}
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Settings2 className="h-4 w-4" />
              {t('maintenance.tabs.plans')}
            </TabsTrigger>
            <TabsTrigger value="costs" className="gap-2">
              <DollarSign className="h-4 w-4" />
              {t('maintenance.tabs.costs')}
            </TabsTrigger>
          </TabsList>

          {/* Work Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className={`absolute ${t('common.dateLocale') === 'ar-MA' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input
                  placeholder={t('maintenance.filters.search')}
                  className={t('common.dateLocale') === 'ar-MA' ? 'pr-10' : 'pl-10'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('maintenance.filters.allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('maintenance.filters.allStatus')}</SelectItem>
                  <SelectItem value="pending">{t('maintenance.stats.pending')}</SelectItem>
                  <SelectItem value="in_progress">{t('maintenance.stats.inProgress')}</SelectItem>
                  <SelectItem value="completed">{t('maintenance.stats.completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredWorkOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-1">{t('maintenance.empty.noOrders')}</h3>
                  <p className="text-sm text-muted-foreground">{t('maintenance.empty.createFirst')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredWorkOrders.map((wo) => (
                  <WorkOrderCard
                    key={wo.id}
                    workOrder={wo}
                    onEdit={handleEdit}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockMaintenancePlans.map((plan) => (
                <MaintenancePlanCard
                  key={plan.id}
                  plan={plan}
                  onCreateWorkOrder={handleCreateFromPlan}
                />
              ))}
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('maintenance.costs.evolution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={maintenanceCostsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString(t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA')} ${t('common.currency')}`,
                        name === 'preventive' ? t('maintenance.costs.preventive') : t('maintenance.costs.corrective')
                      ]}
                    />
                    <Legend formatter={(value) => value === 'preventive' ? t('maintenance.costs.preventive') : t('maintenance.costs.corrective')} />
                    <Bar dataKey="preventive" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="corrective" fill="hsl(217 33% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Summary by Vehicle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('maintenance.costs.vehicleTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVehicles.slice(0, 5).map((vehicle, idx) => {
                    const vehWorkOrders = workOrders.filter(wo => wo.vehicleId === vehicle.id);
                    const totalCost = vehWorkOrders.reduce((acc, wo) => acc + wo.totalCost, 0);
                    return (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🚛</span>
                          <div>
                            <p className="font-medium">{vehicle.plate}</p>
                            <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatCurrency(totalCost)}</p>
                          <p className="text-xs text-muted-foreground">{vehWorkOrders.length} {t('maintenance.costs.interventions')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Work Order Form Dialog */}
        <WorkOrderForm
          open={formOpen}
          onOpenChange={setFormOpen}
          workOrder={selectedWorkOrder}
          onSubmit={handleFormSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
