import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FuelLogCard } from '@/components/fuel/FuelLogCard';
import { FuelForm } from '@/components/fuel/FuelForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Fuel as FuelIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Upload,
  Download,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { mockFuelLogs, mockVehicles, fuelConsumptionByMonth, FuelLog } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';

export default function Fuel() {
  const { t } = useTranslation();
  const [fuelLogs, setFuelLogs] = usePersistentState<FuelLog[]>('fuel_logs', mockFuelLogs);
  const [searchQuery, setSearchQuery] = usePersistentState<string>('fuel_search', '');
  const [vehicleFilter, setVehicleFilter] = usePersistentState<string>('fuel_vehicle_filter', 'all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FuelLog | undefined>();

  const filteredLogs = fuelLogs.filter((log) => {
    const vehicle = mockVehicles.find(v => v.id === log.vehicleId);
    const matchesSearch =
      vehicle?.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.station.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVehicle = vehicleFilter === 'all' || log.vehicleId === vehicleFilter;
    return matchesSearch && matchesVehicle;
  });

  // Stats
  const totalLiters = fuelLogs.reduce((acc, log) => acc + log.liters, 0);
  const totalCost = fuelLogs.reduce((acc, log) => acc + log.totalCost, 0);
  const avgPricePerLiter = totalCost / totalLiters;
  const avgConsumption = 32.5; // Mock value L/100km

  // Consumption by vehicle for chart
  const consumptionByVehicle = mockVehicles
    .filter(v => v.status !== 'inactive')
    .map(vehicle => {
      const vehicleLogs = fuelLogs.filter(l => l.vehicleId === vehicle.id);
      const liters = vehicleLogs.reduce((acc, l) => acc + l.liters, 0);
      const cost = vehicleLogs.reduce((acc, l) => acc + l.totalCost, 0);
      return {
        plate: vehicle.plate,
        liters,
        cost,
      };
    });

  const handleEdit = (log: FuelLog) => {
    setSelectedLog(log);
    setFormOpen(true);
  };

  const handleDelete = (log: FuelLog) => {
    setFuelLogs(prev => prev.filter(l => l.id !== log.id));
    toast({
      title: t('fuel.successDelete'),
      description: t('fuel.deleteDesc'),
    });
  };

  const handleFormSubmit = (data: any) => {
    const totalCost = data.liters * data.pricePerLiter;
    
    if (selectedLog) {
      setFuelLogs(prev =>
        prev.map(l =>
          l.id === selectedLog.id
            ? { ...l, ...data, totalCost }
            : l
        )
      );
      toast({ title: t('fuel.successUpdate') });
    } else {
      const newLog: FuelLog = {
        id: `f${Date.now()}`,
        ...data,
        totalCost,
      };
      setFuelLogs(prev => [newLog, ...prev]);
      toast({ title: t('fuel.successAdd') });
    }
    setSelectedLog(undefined);
  };

  const openNewForm = () => {
    setSelectedLog(undefined);
    setFormOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' ' + t('common.currency');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('nav.fuel')}</h1>
            <p className="text-muted-foreground">{t('fuel.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              {t('fuel.importCsv')}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {t('fuel.export')}
            </Button>
            <Button onClick={openNewForm} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('fuel.newEntry')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <FuelIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLiters.toLocaleString(t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-FR')} {t('common.liters')}</p>
                  <p className="text-xs text-muted-foreground">{t('fuel.totalConsumed')}</p>
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
                  <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                  <p className="text-xs text-muted-foreground">{t('fuel.totalCost')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingDown className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgPricePerLiter.toFixed(2)} {t('common.currency')}</p>
                  <p className="text-xs text-muted-foreground">{t('fuel.avgPrice')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgConsumption} {t('common.liters')}/100</p>
                  <p className="text-xs text-muted-foreground">{t('fuel.avgConsumption')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t('fuel.evolutionTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={fuelConsumptionByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString(t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-FR')} ${t('common.liters')}`, t('fuel.consumption')]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                {t('fuel.consumptionByVehicle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={consumptionByVehicle} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="plate" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'liters' ? `${value} ${t('common.liters')}` : `${value.toLocaleString(t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-FR')} ${t('common.currency')}`,
                      name === 'liters' ? t('fuel.liters') : t('fuel.totalCost')
                    ]}
                  />
                  <Bar dataKey="liters" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Anomaly Alert */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  {t('fuel.anomaly')} - Véhicule 45678-D-4
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('fuel.anomalyDesc', { value: 45, avg: 32.5 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('fuel.searchPlaceholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('fuel.allVehicles')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('fuel.allVehicles')}</SelectItem>
              {mockVehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Logs Grid */}
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FuelIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-1">{t('fuel.noEntriesFound')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('fuel.noEntriesDesc')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLogs.map((log) => (
              <FuelLogCard
                key={log.id}
                log={log}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Fuel Form Dialog */}
        <FuelForm
          open={formOpen}
          onOpenChange={setFormOpen}
          fuelLog={selectedLog}
          onSubmit={handleFormSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
