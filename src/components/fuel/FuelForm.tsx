import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { FuelLog, mockVehicles, mockDrivers } from '@/lib/mock-data';
import { useEffect } from 'react';

const fuelSchemaShape = {
  vehicleId: z.string(),
  driverId: z.string(),
  date: z.string(),
  liters: z.coerce.number(),
  pricePerLiter: z.coerce.number(),
  station: z.string(),
  mileage: z.coerce.number(),
};

const fuelSchemaBase = z.object(fuelSchemaShape);

type FuelFormData = z.infer<typeof fuelSchemaBase>;

const createFuelSchema = (t: (key: string) => string) =>
  z.object({
    vehicleId: fuelSchemaShape.vehicleId.min(1, t('fuel.validation.vehicleRequired')),
    driverId: fuelSchemaShape.driverId.min(1, t('fuel.validation.driverRequired')),
    date: fuelSchemaShape.date.min(1, t('fuel.validation.dateRequired')),
    liters: fuelSchemaShape.liters.min(1, t('fuel.validation.litersRequired')),
    pricePerLiter: fuelSchemaShape.pricePerLiter.min(0.01, t('fuel.validation.priceRequired')),
    station: fuelSchemaShape.station.min(1, t('fuel.validation.stationRequired')),
    mileage: fuelSchemaShape.mileage.min(1, t('fuel.validation.mileageRequired')),
  });

interface FuelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuelLog?: FuelLog;
  onSubmit: (data: FuelFormData) => void;
}

export function FuelForm({ open, onOpenChange, fuelLog, onSubmit }: FuelFormProps) {
  const isEditing = !!fuelLog;
  const { t } = useTranslation();
  
  const form = useForm<FuelFormData>({
    resolver: zodResolver(createFuelSchema(t)),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      liters: 0,
      pricePerLiter: 12.50,
      station: '',
      mileage: 0,
    },
  });

  useEffect(() => {
    if (fuelLog) {
      form.reset({
        vehicleId: fuelLog.vehicleId,
        driverId: fuelLog.driverId,
        date: fuelLog.date,
        liters: fuelLog.liters,
        pricePerLiter: fuelLog.pricePerLiter,
        station: fuelLog.station,
        mileage: fuelLog.mileage,
      });
    } else {
      form.reset({
        vehicleId: '',
        driverId: '',
        date: new Date().toISOString().split('T')[0],
        liters: 0,
        pricePerLiter: 12.50,
        station: '',
        mileage: 0,
      });
    }
  }, [fuelLog, form]);

  const liters = form.watch('liters');
  const pricePerLiter = form.watch('pricePerLiter');
  const totalCost = (liters || 0) * (pricePerLiter || 0);

  const handleSubmit = (data: FuelFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('fuel.form.dialogTitleEdit') : t('fuel.form.dialogTitleNew')}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fuel.form.vehicleLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('fuel.form.vehiclePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fuel.form.driverLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('fuel.form.driverPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fuel.form.dateLabel')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fuel.form.mileageLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="station"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>{t('fuel.form.stationLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fuel.form.stationPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fuel.form.litersLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerLiter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fuel.form.pricePerLiterLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="12.50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Cost Display */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('fuel.form.totalCostLabel')}</span>
                <span className="text-2xl font-bold text-primary">
                  {totalCost.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} {t('common.currency')}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {isEditing ? t('fuel.form.submitUpdate') : t('fuel.form.submitCreate')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
