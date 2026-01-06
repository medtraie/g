import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MissionCard } from '@/components/missions/MissionCard';
import { MissionForm } from '@/components/missions/MissionForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { mockMissions, Mission } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';

export default function Missions() {
  const { t } = useTranslation();

  const statusFilters = [
    { value: 'all', label: t('missions.filterAll'), icon: FileText },
    { value: 'in_progress', label: t('missions.inProgress'), icon: Truck },
    { value: 'planned', label: t('missions.planned'), icon: Clock },
    { value: 'delivered', label: t('missions.delivered'), icon: CheckCircle },
    { value: 'cancelled', label: t('missions.cancelled'), icon: XCircle },
  ];

  const [missions, setMissions] = usePersistentState<Mission[]>('missions_list', mockMissions);
  const [searchQuery, setSearchQuery] = usePersistentState<string>('missions_search', '');
  const [statusFilter, setStatusFilter] = usePersistentState<string>('missions_status_filter', 'all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | undefined>();

  const filteredMissions = missions.filter((mission) => {
    const matchesSearch =
      mission.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: missions.length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    planned: missions.filter(m => m.status === 'planned').length,
    delivered: missions.filter(m => m.status === 'delivered').length,
    totalWeight: missions.filter(m => m.status !== 'cancelled').reduce((acc, m) => acc + m.weight, 0),
  };

  const handleEdit = (mission: Mission) => {
    setSelectedMission(mission);
    setFormOpen(true);
  };

  const handleStatusChange = (mission: Mission, newStatus: Mission['status']) => {
    setMissions(prev =>
      prev.map(m => (m.id === mission.id ? { ...m, status: newStatus } : m))
    );
    toast({
      title: t('missions.statusUpdated'),
      description: t('missions.missionMarkedAs', {
        reference: mission.reference,
        status: t(`missions.${newStatus}`).toLowerCase()
      }),
    });
  };

  const handleFormSubmit = (data: any) => {
    if (selectedMission) {
      // Update existing mission
      setMissions(prev =>
        prev.map(m =>
          m.id === selectedMission.id
            ? {
                ...m,
                client: data.client,
                origin: data.origin,
                destination: data.destination,
                departureDate: `${data.departureDate}T${data.departureTime}:00`,
                estimatedArrival: `${data.departureDate}T${data.estimatedArrivalTime}:00`,
                vehicleId: data.vehicleId,
                driverId: data.driverId,
                cargo: data.cargo,
                weight: data.weight,
              }
            : m
        )
      );
      toast({ title: t('missions.successUpdate') });
    } else {
      // Create new mission
      const newMission: Mission = {
        id: `m${Date.now()}`,
        reference: `MIS-2024-${String(missions.length + 1).padStart(3, '0')}`,
        client: data.client,
        origin: data.origin,
        destination: data.destination,
        status: 'planned',
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        departureDate: `${data.departureDate}T${data.departureTime}:00`,
        estimatedArrival: `${data.departureDate}T${data.estimatedArrivalTime}:00`,
        cargo: data.cargo,
        weight: data.weight,
      };
      setMissions(prev => [newMission, ...prev]);
      toast({
        title: t('missions.successCreate'),
        description: t('missions.referenceLabel', { reference: newMission.reference })
      });
    }
    setSelectedMission(undefined);
  };

  const openNewMissionForm = () => {
    setSelectedMission(undefined);
    setFormOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('nav.missions')}</h1>
            <p className="text-muted-foreground">{t('missions.subtitle')}</p>
          </div>
          <Button onClick={openNewMissionForm} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('missions.form.dialogTitleNew')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">{t('missions.stats.total')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Truck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">{t('missions.inProgress')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.planned}</p>
                  <p className="text-xs text-muted-foreground">{t('missions.planned')}</p>
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
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                  <p className="text-xs text-muted-foreground">{t('missions.delivered')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(stats.totalWeight / 1000).toFixed(1)}t</p>
                  <p className="text-xs text-muted-foreground">{t('missions.stats.tonnage')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('missions.searchPlaceholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              {statusFilters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value} className="gap-2">
                  <filter.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{filter.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Missions Grid */}
        {filteredMissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-1">{t('missions.noMissionsFound')}</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? t('missions.noMissionsDesc')
                  : t('missions.createFirstMission')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Mission Form Dialog */}
        <MissionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          mission={selectedMission}
          onSubmit={handleFormSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
