import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Plus, Filter, LayoutGrid, List, UserCheck, UserX, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DriverCard } from '@/components/drivers/DriverCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { mockDrivers, mockVehicles, type Driver } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { usePersistentState } from '@/hooks/use-persistent-state';

const driverSchemaShape = {
  name: z.string(),
  phone: z.string(),
  license: z.string(),
  licenseExpiry: z.string(),
  vehicleId: z.string().optional(),
};

const driverSchemaBase = z.object(driverSchemaShape);

type DriverFormData = z.infer<typeof driverSchemaBase>;

const createDriverSchema = (t: (key: string) => string) =>
  z.object({
    name: driverSchemaShape.name.min(1, t('drivers.validation.nameRequired')),
    phone: driverSchemaShape.phone.min(1, t('drivers.validation.phoneRequired')),
    license: driverSchemaShape.license.min(1, t('drivers.validation.licenseRequired')),
    licenseExpiry: driverSchemaShape.licenseExpiry.min(1, t('drivers.validation.licenseExpiryRequired')),
    vehicleId: driverSchemaShape.vehicleId,
  });

export default function Drivers() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [drivers, setDrivers] = usePersistentState<Driver[]>('drivers_list', mockDrivers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    on_mission: drivers.filter(d => d.status === 'on_mission').length,
    off_duty: drivers.filter(d => d.status === 'off_duty').length,
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormOpen(true);
  };

  const handleDisable = (driver: Driver) => {
    setDrivers(prev =>
      prev.map(d =>
        d.id === driver.id
          ? { ...d, status: 'off_duty' }
          : d
      )
    );
    toast({
      title: t('drivers.successDisable'),
    });
  };

  const handleFormSubmit = (data: DriverFormData) => {
    if (selectedDriver) {
      setDrivers(prev =>
        prev.map(d =>
          d.id === selectedDriver.id
            ? {
                ...d,
                name: data.name,
                phone: data.phone,
                license: data.license,
                licenseExpiry: data.licenseExpiry,
                vehicleId: data.vehicleId || undefined,
              }
            : d
        )
      );
      toast({ title: t('drivers.successUpdate') });
    } else {
      const newDriver: Driver = {
        id: `d${Date.now()}`,
        name: data.name,
        phone: data.phone,
        license: data.license,
        licenseExpiry: data.licenseExpiry,
        status: 'available',
        vehicleId: data.vehicleId || undefined,
        score: 80,
      };
      setDrivers(prev => [newDriver, ...prev]);
      toast({ title: t('drivers.successAdd') });
    }
    setSelectedDriver(undefined);
    setFormOpen(false);
  };

  const openNewDriverForm = () => {
    setSelectedDriver(undefined);
    setFormOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              {t('nav.drivers')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('drivers.subtitle')}
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={openNewDriverForm}>
            <Plus className="w-4 h-4 mr-2" />
            {t('drivers.addDriver')}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              statusFilter === 'all' 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card hover:border-primary/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{statusCounts.all}</p>
                <p className="text-sm text-muted-foreground">{t('drivers.total')}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setStatusFilter('available')}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              statusFilter === 'available' 
                ? 'border-success bg-success/5' 
                : 'border-border bg-card hover:border-success/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{statusCounts.available}</p>
                <p className="text-sm text-muted-foreground">{t('drivers.available')}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setStatusFilter('on_mission')}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              statusFilter === 'on_mission' 
                ? 'border-info bg-info/5' 
                : 'border-border bg-card hover:border-info/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{statusCounts.on_mission}</p>
                <p className="text-sm text-muted-foreground">{t('drivers.on_mission')}</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setStatusFilter('off_duty')}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              statusFilter === 'off_duty' 
                ? 'border-muted bg-muted/30' 
                : 'border-border bg-card hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <UserX className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{statusCounts.off_duty}</p>
                <p className="text-sm text-muted-foreground">{t('drivers.off_duty')}</p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border border-border">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-xs">
              <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <Input
                placeholder={t('drivers.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn('w-full', isRTL ? 'pr-10' : 'pl-10')}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('drivers.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('drivers.filterAll')}</SelectItem>
                <SelectItem value="available">{t('drivers.available')}</SelectItem>
                <SelectItem value="on_mission">{t('drivers.on_mission')}</SelectItem>
                <SelectItem value="off_duty">{t('drivers.off_duty')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {t('drivers.resultsCount', { count: filteredDrivers.length })}
          </Badge>
          {statusFilter !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="h-6 px-2 text-xs">
              {t('drivers.clearFilter')}
            </Button>
          )}
        </div>

        {filteredDrivers.length > 0 ? (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'
          )}>
            {filteredDrivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                isRTL={isRTL}
                onEdit={handleEdit}
                onDisable={handleDisable}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">{t('drivers.noDriversFound')}</h3>
            <p className="text-muted-foreground">{t('drivers.noDriversDesc')}</p>
          </div>
        )}

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDriver ? t('drivers.editDialogTitle') : t('drivers.addDialogTitle')}
              </DialogTitle>
            </DialogHeader>

            <DriverForm
              driver={selectedDriver}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setFormOpen(false);
                setSelectedDriver(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

interface DriverFormProps {
  driver?: Driver;
  onSubmit: (data: DriverFormData) => void;
  onCancel: () => void;
}

function DriverForm({ driver, onSubmit, onCancel }: DriverFormProps) {
  const { t } = useTranslation();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(createDriverSchema(t)),
    defaultValues: driver
      ? {
          name: driver.name,
          phone: driver.phone,
          license: driver.license,
          licenseExpiry: driver.licenseExpiry,
          vehicleId: driver.vehicleId || '',
        }
      : {
          name: '',
          phone: '',
          license: 'C',
          licenseExpiry: new Date().toISOString().split('T')[0],
          vehicleId: '',
        },
  });

  useEffect(() => {
    if (driver) {
      form.reset({
        name: driver.name,
        phone: driver.phone,
        license: driver.license,
        licenseExpiry: driver.licenseExpiry,
        vehicleId: driver.vehicleId || '',
      });
    } else {
      form.reset({
        name: '',
        phone: '',
        license: 'C',
        licenseExpiry: new Date().toISOString().split('T')[0],
        vehicleId: '',
      });
    }
  }, [driver, form]);

  const availableVehicles = mockVehicles.filter(v => v.status === 'active');

  const handleSubmit = (data: DriverFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('drivers.form.nameLabel')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('drivers.form.phoneLabel')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="license"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('drivers.form.licenseLabel')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('drivers.form.licensePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseExpiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('drivers.form.licenseExpiryLabel')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('drivers.form.vehicleLabel')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('drivers.form.vehiclePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">{t('drivers.form.vehiclePlaceholder')}</SelectItem>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.brand} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit">
            {driver ? t('drivers.form.submitUpdate') : t('drivers.form.submitCreate')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
