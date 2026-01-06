import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Grid,
  List,
  Download,
  ArrowUpDown,
  Truck,
  Wrench,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useVehicles } from '@/hooks/use-vehicles';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@/lib/mock-data';

export default function Vehicles() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.language === 'ar';
  const [viewMode, setViewMode] = usePersistentState<'grid' | 'list'>('vehicles_view_mode', 'grid');
  const [statusFilter, setStatusFilter] = usePersistentState<string>('vehicles_status_filter', 'all');
  const [typeFilter, setTypeFilter] = usePersistentState<string>('vehicles_type_filter', 'all');
  const [searchQuery, setSearchQuery] = usePersistentState<string>('vehicles_search', '');
  const [fuelFilter, setFuelFilter] = usePersistentState<string>('vehicles_fuel_filter', 'all');
  const [sortBy, setSortBy] = usePersistentState<'plate' | 'mileage' | 'status' | 'type'>(
    'vehicles_sort_by',
    'plate'
  );
  const [sortDirection, setSortDirection] = usePersistentState<'asc' | 'desc'>(
    'vehicles_sort_direction',
    'asc'
  );
  const [customVehicles, setCustomVehicles] = usePersistentState<Vehicle[]>('vehicles_custom', []);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState<Vehicle['type']>('truck');
  const [newFuelType, setNewFuelType] = useState<Vehicle['fuelType']>('diesel');
  const [newStatus, setNewStatus] = useState<Vehicle['status']>('active');
  const [newDriver, setNewDriver] = useState('');
  const [newMileage, setNewMileage] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newVin, setNewVin] = useState('');
  const [newFuelConsumption, setNewFuelConsumption] = useState('');
  const [newPayload, setNewPayload] = useState('');
  const [newInsuranceExpiry, setNewInsuranceExpiry] = useState('');
  const [newTechnicalVisitExpiry, setNewTechnicalVisitExpiry] = useState('');
  const [newVignetteExpiry, setNewVignetteExpiry] = useState('');
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: vehicles, isLoading, isError } = useVehicles();

  const allVehicles = [...(vehicles || []), ...customVehicles];

  const filteredVehicles = allVehicles.filter((vehicle) => {
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    const matchesFuel = fuelFilter === 'all' || vehicle.fuelType === fuelFilter;
    const matchesSearch =
      searchQuery === '' ||
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.vin && vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesFuel && matchesSearch;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let compareValue = 0;

    if (sortBy === 'plate') {
      compareValue = a.plate.localeCompare(b.plate);
    } else if (sortBy === 'mileage') {
      compareValue = a.mileage - b.mileage;
    } else if (sortBy === 'status') {
      compareValue = a.status.localeCompare(b.status);
    } else if (sortBy === 'type') {
      compareValue = a.type.localeCompare(b.type);
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  const totalVehicles = allVehicles.length;
  const activeVehicles = allVehicles.filter((v) => v.status === 'active').length;
  const maintenanceVehicles = allVehicles.filter((v) => v.status === 'maintenance').length;
  const inactiveVehicles = allVehicles.filter((v) => v.status === 'inactive').length;
  const avgMileage =
    totalVehicles > 0
      ? Math.round(allVehicles.reduce((sum, v) => sum + v.mileage, 0) / totalVehicles)
      : 0;
  const activeRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
  const monthlyFuelCost = allVehicles.reduce((sum, v) => sum + v.monthlyFuelCost, 0);

  const formatNumber = (num: number) => {
    const locale = t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA';
    return new Intl.NumberFormat(locale).format(num);
  };

  const selectedVehicle =
    selectedVehicleId != null
      ? allVehicles.find((v) => v.id === selectedVehicleId) || null
      : null;

  const isCustomVehicle = (vehicle: Vehicle) => vehicle.id.startsWith('local-');

  const handleCreateOrUpdateVehicle = (event: React.FormEvent) => {
    event.preventDefault();

    const plate = newPlate.trim();
    const brand = newBrand.trim();
    const model = newModel.trim();

    if (!plate || !brand || !model) {
      setFormError(t('vehicles.errorRequired'));
      return;
    }

    const platePattern = /^[0-9]{1,5}-[A-Z]-[0-9]{1,2}$/;
    if (!platePattern.test(plate)) {
      setFormError(t('vehicles.errorPlateFormat'));
      return;
    }

    const duplicate = allVehicles.some(
      (v) =>
        v.plate.toLowerCase() === plate.toLowerCase() &&
        (!editingVehicleId || v.id !== editingVehicleId)
    );
    if (duplicate) {
      setFormError(t('vehicles.errorPlateDuplicate'));
      return;
    }

    const mileageValue = Number(newMileage.replace(/\s+/g, '')) || 0;

    if (editingVehicleId) {
      setCustomVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === editingVehicleId
            ? {
                ...vehicle,
                plate,
                brand,
                model,
                type: newType,
                fuelType: newFuelType,
                status: newStatus,
                driver: newDriver.trim() || undefined,
                mileage: mileageValue,
                year: newYear ? parseInt(newYear) : undefined,
                vin: newVin || undefined,
                fuelConsumption: newFuelConsumption ? parseFloat(newFuelConsumption) : undefined,
                payload: newPayload ? parseFloat(newPayload) : undefined,
                documents: {
                  insurance: { 
                    expiry: newInsuranceExpiry || vehicle.documents.insurance.expiry, 
                    valid: true 
                  },
                  technicalVisit: { 
                    expiry: newTechnicalVisitExpiry || vehicle.documents.technicalVisit.expiry, 
                    valid: true 
                  },
                  vignette: { 
                    expiry: newVignetteExpiry || vehicle.documents.vignette.expiry, 
                    valid: true 
                  },
                },
              }
            : vehicle
        )
      );
      toast({
        title: t('vehicles.successUpdate'),
      });
    } else {
      const now = new Date();
      const year = now.getFullYear();

      const vehicle: Vehicle = {
        id: `local-${Date.now()}`,
        plate,
        brand,
        model,
        type: newType,
        fuelType: newFuelType,
        status: newStatus,
        driver: newDriver.trim() || undefined,
        mileage: mileageValue,
        year: newYear ? parseInt(newYear) : undefined,
        vin: newVin || undefined,
        fuelConsumption: newFuelConsumption ? parseFloat(newFuelConsumption) : undefined,
        payload: newPayload ? parseFloat(newPayload) : undefined,
        documents: {
          insurance: { expiry: newInsuranceExpiry || `${year + 1}-12-31`, valid: true },
          technicalVisit: { expiry: newTechnicalVisitExpiry || `${year + 1}-12-31`, valid: true },
          vignette: { expiry: newVignetteExpiry || `${year + 1}-12-31`, valid: true },
        },
        monthlyFuelCost: 0,
        lastMaintenanceDate: now.toISOString().slice(0, 10),
      };

      setCustomVehicles((current) => [...current, vehicle]);
      toast({
        title: t('vehicles.successAdd'),
      });
    }

    setCreateDialogOpen(false);
    setEditingVehicleId(null);
    setFormError(null);
    setNewPlate('');
    setNewBrand('');
    setNewModel('');
    setNewType('truck');
    setNewFuelType('diesel');
    setNewStatus('active');
    setNewDriver('');
    setNewMileage('');
    setNewYear('');
    setNewVin('');
    setNewFuelConsumption('');
    setNewPayload('');
    setNewInsuranceExpiry('');
    setNewTechnicalVisitExpiry('');
    setNewVignetteExpiry('');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    if (!isCustomVehicle(vehicle)) {
      return;
    }

    setEditingVehicleId(vehicle.id);
    setNewPlate(vehicle.plate);
    setNewBrand(vehicle.brand);
    setNewModel(vehicle.model);
    setNewType(vehicle.type);
    setNewFuelType(vehicle.fuelType);
    setNewStatus(vehicle.status);
    setNewDriver(vehicle.driver ?? '');
    setNewMileage(vehicle.mileage.toString());
    setNewYear(vehicle.year?.toString() ?? '');
    setNewVin(vehicle.vin ?? '');
    setNewFuelConsumption(vehicle.fuelConsumption?.toString() ?? '');
    setNewPayload(vehicle.payload?.toString() ?? '');
    setNewInsuranceExpiry(vehicle.documents.insurance.expiry);
    setNewTechnicalVisitExpiry(vehicle.documents.technicalVisit.expiry);
    setNewVignetteExpiry(vehicle.documents.vignette.expiry);
    setFormError(null);
    setCreateDialogOpen(true);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    if (!isCustomVehicle(vehicle)) {
      return;
    }

    const confirmed = window.confirm(t('vehicles.deleteConfirm'));
    if (!confirmed) {
      return;
    }

    setCustomVehicles((current) => current.filter((item) => item.id !== vehicle.id));
    toast({
      title: t('vehicles.successDelete'),
    });

    if (selectedVehicleId === vehicle.id) {
      setSelectedVehicleId(null);
    }

    if (editingVehicleId === vehicle.id) {
      setEditingVehicleId(null);
      setCreateDialogOpen(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('vehicles.title')}</h1>
            <p className="text-muted-foreground">{t('vehicles.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingVehicleId(null);
                setNewPlate('');
                setNewBrand('');
                setNewModel('');
                setNewType('truck');
                setNewFuelType('diesel');
                setNewStatus('active');
                setNewDriver('');
                setNewMileage('');
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('vehicles.addVehicle')}
            </Button>
          </div>
        </div>

        {!isLoading && !isError && totalVehicles > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title={t('vehicles.activeVehicles')}
              value={`${activeVehicles}/${totalVehicles}`}
              icon={Truck}
              subtitle={`${activeRate}% ${t('vehicles.fleetPercentage')}`}
              variant="success"
            />
            <KPICard
              title={t('vehicles.inMaintenance')}
              value={maintenanceVehicles}
              icon={Wrench}
              subtitle={t('vehicles.ongoingInterventions')}
              variant="warning"
            />
            <KPICard
              title={t('vehicles.inactiveVehicles')}
              value={inactiveVehicles}
              icon={Truck}
              subtitle={t('vehicles.reassignmentPotential')}
              variant="accent"
            />
            <KPICard
              title={t('vehicles.averageMileage')}
              value={formatNumber(avgMileage)}
              icon={Truck}
              subtitle={`${formatNumber(monthlyFuelCost)} ${t('vehicles.monthlyFuelMAD')}`}
              variant="default"
            />
          </div>
        )}

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
                    isRTL ? 'right-3' : 'left-3'
                  )}
                />
                <Input
                  type="search"
                  placeholder={t('vehicles.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn('bg-muted/50 border-0', isRTL ? 'pr-10' : 'pl-10')}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('vehicles.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('vehicles.allStatus')}</SelectItem>
                <SelectItem value="active">{t('vehicles.active')}</SelectItem>
                <SelectItem value="inactive">{t('vehicles.inactive')}</SelectItem>
                <SelectItem value="maintenance">{t('vehicles.maintenance')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('vehicles.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('vehicles.allTypes')}</SelectItem>
                <SelectItem value="truck">{t('vehicles.truck')}</SelectItem>
                <SelectItem value="van">{t('vehicles.van')}</SelectItem>
                <SelectItem value="car">{t('vehicles.car')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fuelFilter} onValueChange={setFuelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('vehicles.fuelType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('vehicles.allFuels')}</SelectItem>
                <SelectItem value="diesel">{t('vehicles.diesel')}</SelectItem>
                <SelectItem value="gasoline">{t('vehicles.gasoline')}</SelectItem>
                <SelectItem value="electric">{t('vehicles.electric')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('vehicles.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plate">{t('vehicles.sortPlate')}</SelectItem>
                  <SelectItem value="mileage">{t('vehicles.sortMileage')}</SelectItem>
                  <SelectItem value="status">{t('vehicles.sortStatus')}</SelectItem>
                  <SelectItem value="type">{t('vehicles.sortType')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
                }
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-destructive">{t('vehicles.errorLoading')}</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredVehicles.length}{' '}
                {filteredVehicles.length > 1 ? t('vehicles.foundPlural') : t('vehicles.found')}
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onViewDetails={(v) => setSelectedVehicleId(v.id)}
                    onEditVehicle={handleEditVehicle}
                    onDeleteVehicle={handleDeleteVehicle}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    compact
                    onViewDetails={(v) => setSelectedVehicleId(v.id)}
                    onEditVehicle={handleEditVehicle}
                    onDeleteVehicle={handleDeleteVehicle}
                  />
                ))}
              </div>
            )}

            {sortedVehicles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {t('vehicles.noVehicleFound')}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {t('vehicles.noVehicleFoundDesc')}
                </p>
                <Button
                  className="mt-4"
                  type="button"
                  onClick={() => {
                    setEditingVehicleId(null);
                    setNewPlate('');
                    setNewBrand('');
                    setNewModel('');
                    setNewType('truck');
                    setNewFuelType('diesel');
                    setNewStatus('active');
                    setNewDriver('');
                    setNewMileage('');
                    setNewYear('');
                    setNewVin('');
                    setNewFuelConsumption('');
                    setNewPayload('');
                    setNewInsuranceExpiry('');
                    setNewTechnicalVisitExpiry('');
                    setNewVignetteExpiry('');
                    setCreateDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('vehicles.addVehicle')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setEditingVehicleId(null);
          }
        }}
      >
        <DialogContent className="max-w-xl md:max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle>
                  {editingVehicleId ? t('vehicles.editDialogTitle') : t('vehicles.addDialogTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('vehicles.addDialogDescription')}
                </DialogDescription>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">
                {editingVehicleId ? t('vehicles.modeEdit') : t('vehicles.modeAdd')}
              </span>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateOrUpdateVehicle} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Preview & Icon Card */}
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className={cn(
                  "relative aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center text-6xl transition-all duration-300",
                  newStatus === 'active' ? "bg-success/5 border-success/20" : 
                  newStatus === 'maintenance' ? "bg-warning/5 border-warning/20" : 
                  "bg-muted border-border"
                )}>
                  {newType === 'truck' ? '🚛' : newType === 'van' ? '🚐' : '🚗'}
                  <div className="absolute bottom-3 right-3">
                    <span className={cn(
                      "flex h-4 w-4 rounded-full",
                      newStatus === 'active' ? "bg-success animate-pulse" : 
                      newStatus === 'maintenance' ? "bg-warning" : 
                      "bg-muted-foreground"
                    )} />
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <p className="text-xl font-bold tracking-tight">
                    {newPlate || t('vehicles.plate')}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {newBrand || t('vehicles.brand')} {newModel || t('vehicles.model')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('vehicles.status')}</span>
                    <span className={cn(
                      "font-medium",
                      newStatus === 'active' ? "text-success" : 
                      newStatus === 'maintenance' ? "text-warning" : 
                      "text-muted-foreground"
                    )}>{t(`vehicles.${newStatus}`)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('vehicles.type')}</span>
                    <span className="font-medium">{t(`vehicles.${newType}`)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('vehicles.fuelType')}</span>
                    <span className="font-medium">{t(`vehicles.${newFuelType}`)}</span>
                  </div>
                </div>
              </div>

              {/* Form Tabs */}
              <div className="flex-1">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="general">{t('vehicles.details')}</TabsTrigger>
                    <TabsTrigger value="technical">{t('maintenance.form.typeLabel')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('vehicles.documents')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {t('vehicles.plate')}
                        </label>
                        <Input
                          value={newPlate}
                          onChange={(e) => setNewPlate(e.target.value)}
                          placeholder={t('vehicles.plateFormatHint')}
                          className="h-9"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">
                          {t('vehicles.brand')}
                        </label>
                        <Input
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          placeholder="Mercedes-Benz"
                          className="h-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">
                          {t('vehicles.model')}
                        </label>
                        <Input
                          value={newModel}
                          onChange={(e) => setNewModel(e.target.value)}
                          placeholder="Actros 1845"
                          className="h-9"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">
                          {t('vehicles.driver')}
                        </label>
                        <Input
                          value={newDriver}
                          onChange={(e) => setNewDriver(e.target.value)}
                          placeholder={t('missions.form.driverPlaceholder')}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.type')}</label>
                        <Select value={newType} onValueChange={(value) => setNewType(value as Vehicle['type'])}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="truck">{t('vehicles.truck')}</SelectItem>
                            <SelectItem value="van">{t('vehicles.van')}</SelectItem>
                            <SelectItem value="car">{t('vehicles.car')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.fuelType')}</label>
                        <Select value={newFuelType} onValueChange={(value) => setNewFuelType(value as Vehicle['fuelType'])}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diesel">{t('vehicles.diesel')}</SelectItem>
                            <SelectItem value="gasoline">{t('vehicles.gasoline')}</SelectItem>
                            <SelectItem value="electric">{t('vehicles.electric')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.status')}</label>
                        <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Vehicle['status'])}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">{t('vehicles.active')}</SelectItem>
                            <SelectItem value="inactive">{t('vehicles.inactive')}</SelectItem>
                            <SelectItem value="maintenance">{t('vehicles.maintenance')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.year')}</label>
                        <Input
                          type="number"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          placeholder="2024"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.mileage')}</label>
                        <Input
                          type="number"
                          value={newMileage}
                          onChange={(e) => setNewMileage(e.target.value)}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium leading-none">{t('vehicles.vin')}</label>
                      <Input
                        value={newVin}
                        onChange={(e) => setNewVin(e.target.value)}
                        placeholder={t('vehicles.vin')}
                        className="h-9 uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.fuelConsumption')}</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newFuelConsumption}
                          onChange={(e) => setNewFuelConsumption(e.target.value)}
                          placeholder="0.0"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.payload')}</label>
                        <Input
                          type="number"
                          value={newPayload}
                          onChange={(e) => setNewPayload(e.target.value)}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.insuranceExpiry')}</label>
                        <Input
                          type="date"
                          value={newInsuranceExpiry}
                          onChange={(e) => setNewInsuranceExpiry(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.technicalVisitExpiry')}</label>
                        <Input
                          type="date"
                          value={newTechnicalVisitExpiry}
                          onChange={(e) => setNewTechnicalVisitExpiry(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">{t('vehicles.vignetteExpiry')}</label>
                        <Input
                          type="date"
                          value={newVignetteExpiry}
                          onChange={(e) => setNewVignetteExpiry(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="px-8 shadow-sm">
                {t('common.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedVehicle != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVehicleId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedVehicle.plate} • {selectedVehicle.brand} {selectedVehicle.model}
                </DialogTitle>
                <DialogDescription>
                  {t('vehicles.detailsDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground text-sm">{t('vehicles.details')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('vehicles.type')}</span>
                      <span className="font-medium">
                        {t(`vehicles.${selectedVehicle.type}`)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('vehicles.status')}</span>
                      <span className="font-medium">
                        {t(`vehicles.${selectedVehicle.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('vehicles.fuelType')}</span>
                      <span className="font-medium">
                        {t(`vehicles.${selectedVehicle.fuelType}`)}
                      </span>
                    </div>
                    {selectedVehicle.year && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('vehicles.year')}</span>
                        <span className="font-medium">{selectedVehicle.year}</span>
                      </div>
                    )}
                    {selectedVehicle.vin && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('vehicles.vin')}</span>
                        <span className="font-medium font-mono text-xs">{selectedVehicle.vin}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('vehicles.mileage')}</span>
                      <span className="font-medium">
                        {formatNumber(selectedVehicle.mileage)} {t('common.km')}
                      </span>
                    </div>
                    {selectedVehicle.fuelConsumption && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('vehicles.fuelConsumption')}</span>
                        <span className="font-medium">{selectedVehicle.fuelConsumption} {t('vehicles.fuelConsumptionUnit')}</span>
                      </div>
                    )}
                    {selectedVehicle.payload && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('vehicles.payload')}</span>
                        <span className="font-medium">
                          {formatNumber(selectedVehicle.payload)} {t('vehicles.payloadUnit')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-foreground text-sm">{t('vehicles.documents')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('vehicles.insuranceExpiry')}</span>
                      <span className="font-medium">
                        {selectedVehicle.documents.insurance.expiry} •{' '}
                        {selectedVehicle.documents.insurance.valid ? t('vehicles.valid') : t('vehicles.toRenew')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('vehicles.technicalVisitExpiry')}</span>
                      <span className="font-medium">
                        {selectedVehicle.documents.technicalVisit.expiry} •{' '}
                        {selectedVehicle.documents.technicalVisit.valid
                          ? t('vehicles.valid')
                          : t('vehicles.toRenew')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('vehicles.vignetteExpiry')}</span>
                      <span className="font-medium">
                        {selectedVehicle.documents.vignette.expiry} •{' '}
                        {selectedVehicle.documents.vignette.valid ? t('vehicles.valid') : t('vehicles.toRenew')}
                      </span>
                    </div>
                  </div>

                  {selectedVehicle.lastPosition && (
                    <div className="mt-4 space-y-2 text-sm">
                      <h3 className="font-medium text-foreground text-sm">{t('vehicles.lastPosition')}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('vehicles.city')}</span>
                        <span className="font-medium">
                          {selectedVehicle.lastPosition.city}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('vehicles.coordinates')}</span>
                        <span className="font-medium">
                          {selectedVehicle.lastPosition.lat.toFixed(4)},{' '}
                          {selectedVehicle.lastPosition.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('vehicles.timestamp')}</span>
                        <span className="font-medium">
                          {new Date(selectedVehicle.lastPosition.timestamp).toLocaleString(
                            t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA'
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
