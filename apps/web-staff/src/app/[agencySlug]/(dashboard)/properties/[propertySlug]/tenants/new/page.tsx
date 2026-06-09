"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  GuidedCreateShell,
  type GuidedCreateStep,
} from "@/components/shared/guided-create-shell";
import { useAddTenant } from "@/hooks/use-add-tenant";
import { usePropertyRoute } from "../../property-route-context";

import { TenantUnitStep } from "@/components/properties/tenant-unit-step";
import { TenantResidentStep } from "@/components/properties/tenant-resident-step";
import { TenantLeaseStep } from "@/components/properties/tenant-lease-step";
import { TenantDepositStep } from "@/components/properties/tenant-deposit-step";
import { TenantSummaryAside } from "@/components/properties/tenant-summary-aside";

// ── Schema ─────────────────────────────────────────────────────────────────────

export const tenantFormSchema = z
  .object({
    unitId: z.string().min(1, "Unit is required"),
    unitNumber: z.string().optional(),
    residentId: z.string().min(1, "Resident is required"),
    residentName: z.string().optional(),
    residentEmail: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    rentAmount: z.union([z.string(), z.number()]),
    depositAmount: z.union([z.string(), z.number()]),
    billingFrequency: z.string().min(1, "Billing frequency is required"),
    recordDepositPayment: z.boolean(),
    depositPaymentMethod: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.recordDepositPayment && !data.depositPaymentMethod) return false;
      return true;
    },
    {
      message: "Payment method is required when recording deposit payment",
      path: ["depositPaymentMethod"],
    }
  );

export type TenantFormValues = z.infer<typeof tenantFormSchema>;

// ── Steps definition ───────────────────────────────────────────────────────────

const STEPS: GuidedCreateStep[] = [
  { id: 1, title: "Unit", description: "Select unit" },
  { id: 2, title: "Resident", description: "Who's moving in" },
  { id: 3, title: "Lease", description: "Terms & dates" },
  { id: 4, title: "Deposit", description: "Payment setup" },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function NewTenantPage() {
  const router = useRouter();
  const { agencySlug, propertySlug } = useParams<{
    agencySlug: string;
    propertySlug: string;
  }>();
  const { propertyId, property } = usePropertyRoute();
  const [step, setStep] = useState(1);

  const addTenantMutation = useAddTenant();

  const methods = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema) as any,
    defaultValues: {
      unitId: "",
      unitNumber: "",
      residentId: "",
      residentName: "",
      residentEmail: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      rentAmount: 0,
      depositAmount: 0,
      billingFrequency: "monthly",
      recordDepositPayment: false,
      depositPaymentMethod: "",
    },
  });

  const { handleSubmit, trigger } = methods;

  const goToNext = async () => {
    let valid = false;

    if (step === 1) {
      valid = await trigger(["unitId"]);
    } else if (step === 2) {
      valid = await trigger(["residentId"]);
    } else if (step === 3) {
      valid = await trigger([
        "startDate",
        "rentAmount",
        "depositAmount",
        "billingFrequency",
      ]);
    }

    if (valid) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 1) router.push(`/${agencySlug}/properties/${propertySlug}/tenants`);
    else setStep((s) => s - 1);
  };

  const handleFormSubmit = async (values: TenantFormValues) => {
    try {
      await addTenantMutation.mutateAsync({
        propertyId: propertyId!,
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

      toast.success("Tenant added successfully");
      router.push(`/${agencySlug}/properties/${propertySlug}/tenants`);
    } catch {
      toast.error("Failed to add tenant. Please try again.");
    }
  };

  if (!propertyId) return null;

  return (
    <FormProvider {...methods}>
      <GuidedCreateShell
        title="Add Tenant"
        description={`Assign a resident to ${property?.name ?? "this property"}.`}
        steps={STEPS}
        currentStep={step}
        onBack={goBack}
        aside={<TenantSummaryAside />}
      >
        <div className="space-y-6">
          {step === 1 && (
            <TenantUnitStep propertyId={propertyId} onNext={goToNext} />
          )}
          {step === 2 && (
            <TenantResidentStep onNext={goToNext} onBack={goBack} />
          )}
          {step === 3 && (
            <TenantLeaseStep onNext={goToNext} onBack={goBack} />
          )}
          {step === 4 && (
            <TenantDepositStep
              onBack={goBack}
              onSubmit={handleSubmit(handleFormSubmit)}
              isPending={addTenantMutation.isPending}
            />
          )}
        </div>
      </GuidedCreateShell>
    </FormProvider>
  );
}
