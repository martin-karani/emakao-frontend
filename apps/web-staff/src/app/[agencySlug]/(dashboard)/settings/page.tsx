"use client";

import { useEffect, useState } from "react";
import { useAgencySettings, useUpdateAgencySettings } from "@/hooks/use-agency-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  Save, 
  Palette, 
  MessageSquare, 
  Mail, 
  Globe,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { useIntegrations } from "@/hooks/use-integrations";

export default function SettingsPage() {
  const { data: settings, isLoading: isSettingsLoading } = useAgencySettings();
  const { data: integrations, isLoading: isIntegrationsLoading } = useIntegrations();
  const updateMutation = useUpdateAgencySettings();

  const [formData, setFormData] = useState({
    branding: {
      logo_url: "",
      primary_color: "#000000",
    },
    communication: {
      sms_provider: "",
      email_provider: "",
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        branding: {
          logo_url: settings.branding.logo_url || "",
          primary_color: settings.branding.primary_color || "#000000",
        },
        communication: {
          sms_provider: settings.communication.sms_provider || "",
          email_provider: settings.communication.email_provider || "",
        }
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success("General settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  if (isSettingsLoading || isIntegrationsLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const smsProviders = integrations?.filter(i => i.provider_type === "sms" && i.is_active) || [];
  const emailProviders = integrations?.filter(i => i.provider_type === "email" && i.is_active) || [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6" />
            General Agency Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your agency identity and default communication channels.
          </p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Customize how your agency appears to residents and staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="logo_url">Agency Logo URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="logo_url" 
                  value={formData.branding.logo_url}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    branding: { ...formData.branding, logo_url: e.target.value } 
                  })}
                  placeholder="https://example.com/logo.png"
                />
                {formData.branding.logo_url && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-muted">
                    <img src={formData.branding.logo_url} alt="Logo" className="max-h-8 max-w-8 object-contain" />
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="primary_color">Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="primary_color" 
                  type="color"
                  className="h-10 w-20 p-1"
                  value={formData.branding.primary_color}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    branding: { ...formData.branding, primary_color: e.target.value } 
                  })}
                />
                <Input 
                  value={formData.branding.primary_color}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    branding: { ...formData.branding, primary_color: e.target.value } 
                  })}
                  placeholder="#000000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Preferred Providers
            </CardTitle>
            <CardDescription>
              Select which active integrations to use for automated messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="sms_provider">Default SMS Provider</Label>
              <Select 
                value={formData.communication.sms_provider || ""} 
                onValueChange={(v) => setFormData({ 
                  ...formData, 
                  communication: { ...formData.communication, sms_provider: v ?? "" } 
                })}
              >
                <SelectTrigger id="sms_provider">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {smsProviders.map(p => (
                    <SelectItem key={p.provider_key} value={p.provider_key}>
                      {p.provider_key.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                  {smsProviders.length === 0 && (
                    <SelectItem value="none" disabled>No active SMS integrations</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email_provider">Default Email Provider</Label>
              <Select 
                value={formData.communication.email_provider || ""} 
                onValueChange={(v) => setFormData({ 
                  ...formData, 
                  communication: { ...formData.communication, email_provider: v ?? "" } 
                })}
              >
                <SelectTrigger id="email_provider">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {emailProviders.map(p => (
                    <SelectItem key={p.provider_key} value={p.provider_key}>
                      {p.provider_key.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                  {emailProviders.length === 0 && (
                    <SelectItem value="none" disabled>No active Email integrations</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
