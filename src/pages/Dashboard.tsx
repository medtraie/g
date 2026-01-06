import { useTranslation } from 'react-i18next';
import {
  Truck,
  Package,
  AlertTriangle,
  Fuel,
  Wrench,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { AlertItem } from '@/components/dashboard/AlertItem';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { Button } from '@/components/ui/button';
import {
  dashboardKPIs,
  mockVehicles,
  mockAlerts,
  mockMissions,
  fuelConsumptionByMonth,
  costByVehicle,
  fleetAvailabilityByDay,
} from '@/lib/mock-data';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(25, 95%, 53%)'];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const formatNumber = (num: number) => {
    const locale = t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA';
    return new Intl.NumberFormat(locale).format(num);
  };

  const monthKeyMap: Record<string, 'aug' | 'sep' | 'oct' | 'nov' | 'dec' | 'jan'> = {
    'Août': 'aug',
    'Sep': 'sep',
    'Oct': 'oct',
    'Nov': 'nov',
    'Déc': 'dec',
    'Jan': 'jan',
  };

  const localizedFuelData = fuelConsumptionByMonth.map(item => ({
    ...item,
    month: t(`common.months.${monthKeyMap[item.month]}`),
  }));

  const localizedAvailabilityData = fleetAvailabilityByDay.map(item => ({
    ...item,
    day: t(`common.days.${item.day.toLowerCase() === 'lun' ? 'mon' : 
                          item.day.toLowerCase() === 'mar' ? 'tue' :
                          item.day.toLowerCase() === 'mer' ? 'wed' :
                          item.day.toLowerCase() === 'jeu' ? 'thu' :
                          item.day.toLowerCase() === 'ven' ? 'fri' :
                          item.day.toLowerCase() === 'sam' ? 'sat' : 'sun'}`),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">{t('common.export')}</Button>
            <Button>{t('vehicles.addVehicle')}</Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title={t('dashboard.activeVehicles')}
            value={`${dashboardKPIs.activeVehicles}/${dashboardKPIs.totalVehicles}`}
            icon={Truck}
            subtitle={`${dashboardKPIs.fleetAvailability.toFixed(0)}% ${t('dashboard.available')}`}
            variant="default"
          />
          <KPICard
            title={t('dashboard.ongoingMissions')}
            value={dashboardKPIs.ongoingMissions}
            icon={Package}
            subtitle={t('dashboard.today')}
            variant="success"
          />
          <KPICard
            title={t('dashboard.pendingAlerts')}
            value={dashboardKPIs.pendingAlerts}
            icon={AlertTriangle}
            variant="warning"
          />
          <KPICard
            title={t('dashboard.monthlyFuelCost')}
            value={`${formatNumber(dashboardKPIs.monthlyFuelCost / 1000)}K`}
            subtitle={t('common.currency')}
            icon={Fuel}
            trend={{ value: 12, isPositive: false }}
            variant="accent"
          />
          <KPICard
            title={t('dashboard.upcomingMaintenance')}
            value={dashboardKPIs.upcomingMaintenance}
            icon={Wrench}
            subtitle={t('dashboard.thisWeek')}
            variant="destructive"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fuel Consumption Chart */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{t('dashboard.fuelConsumption')}</h3>
                <p className="text-sm text-muted-foreground">{t('dashboard.last6Months')}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{t('dashboard.consumptionL')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info" />
                  <span className="text-muted-foreground">{t('dashboard.costMAD')}</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={localizedFuelData}>
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} reversed={isRTL} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} orientation={isRTL ? 'right' : 'left'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                  formatter={(value: number) => [formatNumber(value), t('dashboard.consumptionL')]}
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="hsl(173, 58%, 39%)"
                  strokeWidth={2}
                  fill="url(#colorConsumption)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fleet Availability */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{t('dashboard.fleetAvailability')}</h3>
                <p className="text-sm text-muted-foreground">{t('dashboard.thisWeek')}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={localizedAvailabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} reversed={isRTL} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} orientation={isRTL ? 'right' : 'left'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                  formatter={(value: number) => [formatNumber(value), t('dashboard.available')]}
                />
                <Bar dataKey="available" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Alerts */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{t('dashboard.recentAlerts')}</h3>
              <Link to="/alerts">
                <Button variant="ghost" size="sm" className="text-primary">
                  {t('dashboard.viewAll')}
                  <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {mockAlerts.slice(0, 4).map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          {/* Cost by Vehicle */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{t('dashboard.costByVehicle')}</h3>
                <p className="text-sm text-muted-foreground">{t('dashboard.thisMonth')}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costByVehicle} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} reversed={isRTL} />
                <YAxis dataKey="plate" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} orientation={isRTL ? 'right' : 'left'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                  formatter={(value: number) => [`${formatNumber(value)} ${t('common.currency')}`]}
                />
                <Bar dataKey="fuel" stackId="a" fill="hsl(173, 58%, 39%)" />
                <Bar dataKey="maintenance" stackId="a" fill="hsl(199, 89%, 48%)" />
                <Bar dataKey="other" stackId="a" fill="hsl(25, 95%, 53%)" radius={isRTL ? [4, 0, 0, 4] : [0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Missions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{t('dashboard.recentMissions')}</h3>
              <Link to="/missions">
                <Button variant="ghost" size="sm" className="text-primary">
                  {t('dashboard.viewAll')}
                  <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {mockMissions.slice(0, 4).map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mission.reference}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {mission.origin} → {mission.destination}
                    </p>
                  </div>
                  <span
                    className={`status-badge ${
                      mission.status === 'delivered'
                        ? 'status-active'
                        : mission.status === 'in_progress'
                        ? 'status-warning'
                        : 'status-inactive'
                    }`}
                  >
                    {mission.status === 'delivered'
                      ? t('missions.delivered')
                      : mission.status === 'in_progress'
                      ? t('missions.inProgress')
                      : t('missions.planned')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
