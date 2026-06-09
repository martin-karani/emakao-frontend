"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchSelectDialog } from "@/components/shared/search-select-dialog";
import { PersonFormDialog } from "@/components/shared/person-form-dialog";

import { useUnits } from "@/hooks/use-units";
import { useAddTenant } from "@/hooks/use-add-tenant";

const formSchema = z.object({
  unitId: z.string().min(1, "Unit is required"),
  residentId: z.string().min(1, "Resident is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  rentAmount: z.union([z.string(), z.number()]),
  depositAmount: z.union([z.string(), z.number()]),
  billingFrequency: z.string().min(1, "Billing frequency is required"),
  recordDepositPayment: z.boolean(),
  depositPaymentMethod: z.string().optional(),
}).refine(
  (data) => {
    if (data.recordDepositPayment && !data.depositPaymentMethod) {
      return false;
    }
    return true;
  },
  {
    message: "Payment method is required if recording deposit",
    path: ["depositPaymentMethod"],
  }
);

interface AddTenantModalProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTenantModal({
  propertyId,
  open,
  onOpenChange,
}: AddTenantModalProps) {
  const [step, setStep] = useState(1);
  const [selectedResidentName, setSelectedResidentName] = useState<string>("");

  const { data: units } = useUnits(propertyId);
  const vacantUnits = units?.filter((u) => u.status === "vacant") || [];

  const addTenantMutation = useAddTenant();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitId: "",
      residentId: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      rentAmount: 0,
      depositAmount: 0,
      billingFrequency: "monthly",
      recordDepositPayment: false,
      depositPaymentMethod: "",
    },
  });

  const recordDepositPaymentValue = watch("recordDepositPayment");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addTenantMutation.mutateAsync({
        propertyId,
        unitId: values.unitId,
        residentId: values.residentId,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        rentAmountKes: Number(values.rentAmount),
        depositKes: Number(values.depositAmount),
        billingFrequency: values.billingFrequency,
        recordDepositPayment: values.recordDepositPayment,
        depositPaymentMethod: values.depositPaymentMethod || undefined,
      });
      reset();
      setStep(1);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isStep1Valid = watch("unitId") !== "";
  const isStep2Valid = watch("residentId") !== "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Step {step} of 4:{" "}
              {step === 1 && "Select Unit"}
              {step === 2 && "Select Resident"}
              {step === 3 && "Lease Details"}
              {step === 4 && "Deposit Payment"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <Field data-invalid={!!errors.unitId}>
                  <Label>Select Vacant Unit</Label>
                  <Controller
                    control={control}
                    name="unitId"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {vacantUnits.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No vacant units available
                            </div>
                          ) : (
                            vacantUnits.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.unit_number}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.unitId && <FieldError>{errors.unitId.message}</FieldError>}
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Field data-invalid={!!errors.residentId}>
                  <Label>Selected Resident</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={selectedResidentName} 
                      readOnly 
                      placeholder="No resident selected" 
                    />
                    <SearchSelectDialog
                      title="Search Resident"
                      placeholder="Search by name, email, or phone..."
                      trigger={
                        <Button type="button" variant="secondary">
                          Search
                        </Button>
                      }
                      searchFn={async (term) => {
                        const res = await fetch(`/api/proxy/api/v1/residents?q=${term}`);
                        if (!res.ok) return [];
                        const data = await res.json();
                        return data.map((d: any) => ({
                          id: d.id,
                          title: d.full_name,
                          subtitle: d.email || d.phone,
                          data: d,
                        }));
                      }}
                      onSelect={(res: any) => {
                        if (res) {
                          setValue("residentId", res.id, { shouldValidate: true });
                          setSelectedResidentName(res.full_name);
                        }
                      }}
                    />
                  </div>
                  {errors.residentId && <FieldError>{errors.residentId.message}</FieldError>}
                </Field>
                <div className="text-sm text-center text-muted-foreground">
                  or
                </div>
                <PersonFormDialog
                  title="Invite New Resident"
                  trigger={
                    <Button type="button" variant="outline" className="w-full">
                      Invite New Resident
                    </Button>
                  }
                  onAdd={async (data) => {
                    // Create resident
                    const res = await fetch("/api/proxy/api/v1/residents", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    if (!res.ok) {
                      console.error("Failed to create resident");
                      return;
                    }
                    const newRes = await res.json();
                    setValue("residentId", newRes.id, { shouldValidate: true });
                    setSelectedResidentName(newRes.full_name);
                  }}
                />
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.rentAmount}>
                  <Label>Rent Amount (KES)</Label>
                  <Input type="number" {...register("rentAmount")} />
                  {errors.rentAmount && <FieldError>{errors.rentAmount.message}</FieldError>}
                </Field>
                <Field data-invalid={!!errors.depositAmount}>
                  <Label>Deposit Amount (KES)</Label>
                  <Input type="number" {...register("depositAmount")} />
                  {errors.depositAmount && <FieldError>{errors.depositAmount.message}</FieldError>}
                </Field>
                <Field data-invalid={!!errors.billingFrequency}>
                  <Label>Billing Frequency</Label>
                  <Controller
                    control={control}
                    name="billingFrequency"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.billingFrequency && <FieldError>{errors.billingFrequency.message}</FieldError>}
                </Field>
                <div className="col-span-2 grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!errors.startDate}>
                    <Label>Start Date</Label>
                    <Input type="date" {...register("startDate")} />
                    {errors.startDate && <FieldError>{errors.startDate.message}</FieldError>}
                  </Field>
                  <Field data-invalid={!!errors.endDate}>
                    <Label>End Date (Optional)</Label>
                    <Input type="date" {...register("endDate")} />
                    {errors.endDate && <FieldError>{errors.endDate.message}</FieldError>}
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <Field>
                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Controller
                      control={control}
                      name="recordDepositPayment"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <div className="space-y-1 leading-none">
                      <Label>Record deposit payment now?</Label>
                      <p className="text-sm text-muted-foreground">
                        This will record the deposit charge and a matching payment immediately.
                      </p>
                    </div>
                  </div>
                </Field>

                {recordDepositPaymentValue && (
                  <Field data-invalid={!!errors.depositPaymentMethod}>
                    <Label>Payment Method</Label>
                    <Controller
                      control={control}
                      name="depositPaymentMethod"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mpesa_paybill">M-Pesa</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.depositPaymentMethod && <FieldError>{errors.depositPaymentMethod.message}</FieldError>}
                  </Field>
                )}
              </div>
            )}

            <DialogFooter className="mt-6 flex justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              ) : (
                <div /> // spacer
              )}
              
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !isStep1Valid) ||
                    (step === 2 && !isStep2Valid)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={addTenantMutation.isPending}
                >
                  {addTenantMutation.isPending ? "Creating..." : "Create Lease"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
