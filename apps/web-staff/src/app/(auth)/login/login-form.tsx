"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Building2, Loader2 } from "lucide-react";

/**
 * Validates `contact` as either a standard email address OR a Kenyan mobile
 * number in the formats the backend's ContactMethod::parse() accepts:
 *   07XXXXXXXX  (10 digits, leading zero)
 *   +2547XXXXXXXX (E.164 with plus)
 *   2547XXXXXXXX  (E.164 without plus)
 */
const isEmailOrKEPhone = (v: string) => {
  if (v.includes("@")) {
    return z.string().email().safeParse(v).success;
  }
  return /^(\+?254|0)7\d{8}$/.test(v.replace(/[\s\-]/g, ""));
};

const loginSchema = z.object({
  /**
   * agency_slug — identifies the tenant on the multi-tenant backend.
   * Validated as `#[garde(length(min = 1))]` on the Rust side.
   */
  agency_slug: z
    .string()
    .min(1, "Agency workspace is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, or hyphens"
    ),

  /**
   * contact — email OR Kenyan phone number.
   * Backend StaffLoginDto: `#[garde(length(min = 3))]`
   * ContactMethod::parse() routes to Email or Phone automatically.
   */
  contact: z
    .string()
    .min(3, "Enter your email or phone number")
    .refine(isEmailOrKEPhone, {
      message: "Enter a valid email address or Kenyan phone number (07xx...)",
    }),

  /**
   * password — `#[garde(length(min = 8))]`
   */
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { agency_slug: "", contact: "", password: "" },
  });

  async function onSubmit(values: LoginInputs) {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid credentials. Please try again.");
      }

      const data = await res.json();

      // Backend signals the user must set a new password (first login / invite flow)
      if (data.must_change_password) {
        router.push("/change-password");
        return;
      }

      // Redirect to originally-intended page or the overview dashboard
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">eMakao</span>
        </div>

        <div className="space-y-4">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "Manage your entire property portfolio — leases, payments,
            maintenance, and tenants — from one place."
          </blockquote>
          <p className="text-primary-foreground/70 text-sm">
            Built for Kenyan property managers
          </p>
        </div>

        {/* Decorative grid */}
        <div
          className="grid grid-cols-3 gap-3 opacity-20 select-none"
          aria-hidden
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-primary-foreground/30"
              style={{ opacity: 0.3 + (i % 3) * 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">eMakao</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sign in to your workspace
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your agency slug and staff credentials to continue.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* agency_slug — identifies the tenant */}
            <Field data-invalid={!!errors.agency_slug || undefined}>
              <Label htmlFor="agency_slug">Agency workspace</Label>
              <Input
                id="agency_slug"
                type="text"
                placeholder="your-agency"
                autoComplete="organization"
                aria-invalid={!!errors.agency_slug}
                {...register("agency_slug")}
              />
              {errors.agency_slug && (
                <FieldError>{errors.agency_slug.message}</FieldError>
              )}
            </Field>

            {/* contact — email or Kenyan phone */}
            <Field data-invalid={!!errors.contact || undefined}>
              <Label htmlFor="contact">Email or phone number</Label>
              <Input
                id="contact"
                type="text"
                placeholder="name@agency.co.ke or 0712 345 678"
                autoComplete="username"
                inputMode="email"
                aria-invalid={!!errors.contact}
                {...register("contact")}
              />
              {errors.contact && (
                <FieldError>{errors.contact.message}</FieldError>
              )}
            </Field>

            {/* password */}
            <Field data-invalid={!!errors.password || undefined}>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Staff access only. Contact your administrator if you need an
            account.
          </p>
        </div>
      </div>
    </div>
  );
}
