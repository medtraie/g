import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Mission, mockVehicles, mockDrivers } from '@/lib/mock-data';

const missionSchemaShape = {
  client: z.string(),
  origin: z.string(),
  destination: z.string(),
  departureDate: z.string(),
  departureTime: z.string(),
  estimatedArrivalTime: z.string(),
  vehicleId: z.string(),
  driverId: z.string(),
  cargo: z.string(),
  weight: z.coerce.number(),
  notes: z.string().optional(),
};

const missionSchemaBase = z.object(missionSchemaShape);

type MissionFormData = z.infer<typeof missionSchemaBase>;

const createMissionSchema = (t: (key: string) => string) =>
  z.object({
    client: missionSchemaShape.client.min(1, t('missions.validation.clientRequired')),
    origin: missionSchemaShape.origin.min(1, t('missions.validation.originRequired')),
    destination: missionSchemaShape.destination.min(1, t('missions.validation.destinationRequired')),
    departureDate: missionSchemaShape.departureDate.min(1, t('missions.validation.departureDateRequired')),
    departureTime: missionSchemaShape.departureTime.min(1, t('missions.validation.departureTimeRequired')),
    estimatedArrivalTime: missionSchemaShape.estimatedArrivalTime.min(
      1,
      t('missions.validation.estimatedArrivalTimeRequired'),
    ),
    vehicleId: missionSchemaShape.vehicleId.min(1, t('missions.validation.vehicleRequired')),
    driverId: missionSchemaShape.driverId.min(1, t('missions.validation.driverRequired')),
    cargo: missionSchemaShape.cargo.min(1, t('missions.validation.cargoRequired')),
    weight: missionSchemaShape.weight.min(1, t('missions.validation.weightRequired')),
    notes: missionSchemaShape.notes,
  });

interface MissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission?: Mission;
  onSubmit: (data: MissionFormData) => void;
}

export function MissionForm({ open, onOpenChange, mission, onSubmit }: MissionFormProps) {
  const isEditing = !!mission;
  const { t } = useTranslation();
  
  const form = useForm<MissionFormData>({
    resolver: zodResolver(createMissionSchema(t)),
    defaultValues: mission ? {
      client: mission.client,
      origin: mission.origin,
      destination: mission.destination,
      departureDate: mission.departureDate.split('T')[0],
      departureTime: mission.departureDate.split('T')[1]?.substring(0, 5) || '08:00',
      estimatedArrivalTime: mission.estimatedArrival.split('T')[1]?.substring(0, 5) || '12:00',
      vehicleId: mission.vehicleId,
      driverId: mission.driverId,
      cargo: mission.cargo,
      weight: mission.weight,
      notes: '',
    } : {
      client: '',
      origin: '',
      destination: '',
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: '08:00',
      estimatedArrivalTime: '12:00',
      vehicleId: '',
      driverId: '',
      cargo: '',
      weight: 0,
      notes: '',
    },
  });

  const availableVehicles = mockVehicles.filter(v => v.status === 'active');
  const availableDrivers = mockDrivers.filter(d => d.status === 'available' || d.status === 'on_mission');

  const handleSubmit = (data: MissionFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('missions.form.dialogTitleEdit') : t('missions.form.dialogTitleNew')}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('missions.form.clientLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('missions.form.clientPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.originLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('missions.form.originPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.destinationLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('missions.form.destinationPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.departureDateLabel')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.departureTimeLabel')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedArrivalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.estimatedArrivalLabel')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.vehicleLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('missions.form.vehiclePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.driverLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('missions.form.driverPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - Permis {driver.license}
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
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.cargoLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('missions.form.cargoPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('missions.form.weightLabel')}</FormLabel>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('missions.form.notesLabel')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('missions.form.notesPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {isEditing ? t('missions.form.submitUpdate') : t('missions.form.submitCreate')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
