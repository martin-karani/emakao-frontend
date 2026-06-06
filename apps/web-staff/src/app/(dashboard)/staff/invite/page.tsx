"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Info, Mail, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStaff } from "@/hooks/use-staff";

export default function InviteStaffPage() {
  const router = useRouter();
  const { mutate } = useStaff();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      role: formData.get("role"),
    };

    try {
      const res = await fetch("/api/proxy/v1/staff/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to invite staff member");
      }

      await mutate();
      router.push("/staff");
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/staff")}
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Invite Staff</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card>
          <form onSubmit={onSubmit}>
            <CardHeader>
              <CardTitle>Staff Details</CardTitle>
              <CardDescription>
                Invite a new member to your agency. They will receive an email
                with instructions to set up their account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="Jane"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Doe"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 size-4 text-muted-foreground z-10" />
                  <Select name="role" defaultValue="agent" required>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">
                        Agent (View assigned properties)
                      </SelectItem>
                      <SelectItem value="manager">
                        Manager (Manage properties and tenants)
                      </SelectItem>
                      <SelectItem value="admin">
                        Admin (Full agency access)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                variant="ghost"
                type="button"
                onClick={() => router.push("/staff")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending Invite..." : "Send Invite"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-muted/20 p-6">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-6">
              <Info className="size-4 text-primary" />
              How it works
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                  1
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Send Invitation</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Complete the form and send the invite. An automated email is
                    sent to the recipient instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                  2
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Recipient Setup</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    They will click the secure link in the email to set their
                    password and finalize their profile.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                  3
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Immediate Access</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Once registered, they get immediate access based on the
                    permissions of their assigned role.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
              Pro Tip
            </h3>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Admins have full visibility, while Agents can only see properties
              specifically assigned to them. Choose roles carefully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
