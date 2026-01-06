import { useForm, useFieldArray } from 'react-hook-form';
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
import { WorkOrder, mockVehicles } from '@/lib/mock-data';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

const partSchemaShape = {
  name: z.string(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number(),
};

const partSchemaBase = z.object(partSchemaShape);

const workOrderSchemaShape = {
  vehicleId: z.string(),
  type: z.enum(['preventive', 'corrective', 'inspection']),
  priority: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  diagnosis: z.string().optional(),
  garage: z.string().optional(),
  scheduledDate: z.string(),
  laborCost: z.coerce.number(),
  parts: z.array(partSchemaBase),
  notes: z.string().optional(),
};

const workOrderSchemaBase = z.object(workOrderSchemaShape);

type WorkOrderFormData = z.infer<typeof workOrderSchemaBase>;

const createPartSchema = (t: (key: string) => string) =>
  z.object({
    name: partSchemaShape.name.min(1, t('maintenance.validation.partNameRequired')),
    quantity: partSchemaShape.quantity.min(1, t('maintenance.validation.partQuantityRequired')),
    unitPrice: partSchemaShape.unitPrice.min(0, t('maintenance.validation.partPriceRequired')),
  });

const createWorkOrderSchema = (t: (key: string) => string) =>
  z.object({
    vehicleId: workOrderSchemaShape.vehicleId.min(1, t('maintenance.validation.vehicleRequired')),
    type: workOrderSchemaShape.type,
    priority: workOrderSchemaShape.priority,
    description: workOrderSchemaShape.description.min(1, t('maintenance.validation.descriptionRequired')),
    diagnosis: workOrderSchemaShape.diagnosis,
    garage: workOrderSchemaShape.garage,
    scheduledDate: workOrderSchemaShape.scheduledDate.min(1, t('maintenance.validation.dateRequired')),
    laborCost: workOrderSchemaShape.laborCost.min(0),
    parts: z.array(createPartSchema(t)),
    notes: workOrderSchemaShape.notes,
  });

interface WorkOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: WorkOrder;
  onSubmit: (data: WorkOrderFormData) => void;
}

export function WorkOrderForm({ open, onOpenChange, workOrder, onSubmit }: WorkOrderFormProps) {
  const isEditing = !!workOrder;
  const { t } = useTranslation();
  
  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(createWorkOrderSchema(t)),
    defaultValues: {
      vehicleId: '',
      type: 'preventive',
      priority: 'medium',
      description: '',
      diagnosis: '',
      garage: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      laborCost: 0,
      parts: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'parts',
  });

  useEffect(() => {
    if (workOrder) {
      form.reset({
        vehicleId: workOrder.vehicleId,
        type: workOrder.type,
        priority: workOrder.priority,
        description: workOrder.description,
        diagnosis: workOrder.diagnosis || '',
        garage: workOrder.garage || '',
        scheduledDate: workOrder.scheduledDate,
        laborCost: workOrder.laborCost,
        parts: workOrder.parts,
        notes: workOrder.notes || '',
      });
    } else {
      form.reset({
        vehicleId: '',
        type: 'preventive',
        priority: 'medium',
        description: '',
        diagnosis: '',
        garage: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        laborCost: 0,
        parts: [],
        notes: '',
      });
    }
  }, [workOrder, form]);

  const parts = form.watch('parts');
  const laborCost = form.watch('laborCost') || 0;
  const partsCost = parts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const totalCost = laborCost + partsCost;

  const formatNumber = (num: number) => {
    const locale = t('common.dateLocale') === 'ar-MA' ? 'ar-MA' : 'fr-MA';
    return new Intl.NumberFormat(locale).format(num);
  };

  const handleSubmit = (data: WorkOrderFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('maintenance.form.dialogTitleEdit') : t('maintenance.form.dialogTitleNew')}
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
                    <FormLabel>{t('maintenance.form.vehicleLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('maintenance.form.vehiclePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.brand}
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
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maintenance.form.scheduledDateLabel')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maintenance.form.typeLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="preventive">{t('maintenance.form.typePreventive')}</SelectItem>
                        <SelectItem value="corrective">{t('maintenance.form.typeCorrective')}</SelectItem>
                        <SelectItem value="inspection">{t('maintenance.form.typeInspection')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maintenance.form.priorityLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{t('maintenance.form.priorityLow')}</SelectItem>
                        <SelectItem value="medium">{t('maintenance.form.priorityMedium')}</SelectItem>
                        <SelectItem value="high">{t('maintenance.form.priorityHigh')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('maintenance.form.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('maintenance.form.descriptionPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('maintenance.form.diagnosisLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('maintenance.form.diagnosisPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="garage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maintenance.form.garageLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('maintenance.form.garagePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="laborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maintenance.form.laborCostLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Parts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>{t('maintenance.form.partsLabel')}</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })}
                >
                  <Plus className={`h-4 w-4 ${t('common.dateLocale') === 'ar-MA' ? 'ml-1' : 'mr-1'}`} />
                  {t('maintenance.form.addPartButton')}
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-5">
                    <Input
                      placeholder={t('maintenance.form.partNamePlaceholder')}
                      {...form.register(`parts.${index}.name`)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder={t('maintenance.form.partQuantityPlaceholder')}
                      {...form.register(`parts.${index}.quantity`)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      placeholder={t('maintenance.form.partPricePlaceholder')}
                      {...form.register(`parts.${index}.unitPrice`)}
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('maintenance.form.notesLabel')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('maintenance.form.notesPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Cost */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{t('maintenance.form.summaryLaborLabel')}</span>
                <span>{formatNumber(laborCost)} {t('common.currency')}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{t('maintenance.form.summaryPartsLabel')}</span>
                <span>{formatNumber(partsCost)} {t('common.currency')}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between font-bold">
                <span>{t('maintenance.form.summaryTotalLabel')}</span>
                <span className="text-xl text-primary">
                  {formatNumber(totalCost)} {t('common.currency')}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {isEditing ? t('maintenance.form.submitUpdate') : t('maintenance.form.submitCreate')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
