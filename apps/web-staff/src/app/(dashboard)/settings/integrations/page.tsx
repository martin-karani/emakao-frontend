"use client";

import { useState } from "react";
import {
  useIntegrations,
  useUpsertIntegration,
  useDeleteIntegration,
  Integration,
} from "@/hooks/use-integrations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Blocks,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
  CreditCard,
  HardDrive,
  ExternalLink,
  Trash2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Provider {
  type: "sms" | "email" | "payment" | "storage";
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  fields: {
    key: string;
    label: string;
    type: "text" | "password";
    placeholder?: string;
    section: "credentials" | "settings";
  }[];
}

const AVAILABLE_PROVIDERS: Provider[] = [
  {
    type: "sms",
    key: "africas_talking",
    name: "Africa's Talking",
    description:
      "Send SMS notifications across Africa using Africa's Talking API.",
    icon: MessageSquare,
    fields: [
      {
        key: "username",
        label: "Username",
        type: "text",
        section: "credentials",
      },
      {
        key: "api_key",
        label: "API Key",
        type: "password",
        section: "credentials",
      },
      {
        key: "sender_id",
        label: "Sender ID (Optional)",
        type: "text",
        section: "settings",
        placeholder: "e.g. EMAKAO",
      },
    ],
  },
  {
    type: "sms",
    key: "twilio",
    name: "Twilio",
    description: "Global SMS and communication platform.",
    icon: MessageSquare,
    fields: [
      {
        key: "account_sid",
        label: "Account SID",
        type: "text",
        section: "credentials",
      },
      {
        key: "auth_token",
        label: "Auth Token",
        type: "password",
        section: "credentials",
      },
      {
        key: "from_number",
        label: "From Number",
        type: "text",
        section: "settings",
        placeholder: "+123456789",
      },
    ],
  },
  {
    type: "email",
    key: "sendgrid",
    name: "SendGrid",
    description: "Transactional email delivery service.",
    icon: Mail,
    fields: [
      {
        key: "api_key",
        label: "API Key",
        type: "password",
        section: "credentials",
      },
      {
        key: "from_email",
        label: "From Email",
        type: "text",
        section: "settings",
        placeholder: "hello@example.com",
      },
      {
        key: "from_name",
        label: "From Name",
        type: "text",
        section: "settings",
        placeholder: "Emakao Support",
      },
    ],
  },
  {
    type: "payment",
    key: "mpesa",
    name: "M-Pesa",
    description: "Mobile money payments via Safaricom M-Pesa (Daraja API).",
    icon: CreditCard,
    fields: [
      {
        key: "consumer_key",
        label: "Consumer Key",
        type: "text",
        section: "credentials",
      },
      {
        key: "consumer_secret",
        label: "Consumer Secret",
        type: "password",
        section: "credentials",
      },
      {
        key: "passkey",
        label: "Passkey",
        type: "password",
        section: "credentials",
      },
      {
        key: "business_short_code",
        label: "Business Short Code",
        type: "text",
        section: "settings",
      },
    ],
  },
  {
    type: "storage",
    key: "s3",
    name: "AWS S3 / Cloud Storage",
    description: "Secure file storage for documents, photos, and reports.",
    icon: HardDrive,
    fields: [
      {
        key: "access_key_id",
        label: "Access Key ID",
        type: "text",
        section: "credentials",
      },
      {
        key: "secret_access_key",
        label: "Secret Access Key",
        type: "password",
        section: "credentials",
      },
      {
        key: "bucket_name",
        label: "Bucket Name",
        type: "text",
        section: "settings",
      },
      {
        key: "region",
        label: "Region",
        type: "text",
        section: "settings",
        placeholder: "e.g. eu-central-1",
      },
    ],
  },
];

export default function IntegrationsPage() {
  const { data: activeIntegrations, isLoading } = useIntegrations();
  const upsertMutation = useUpsertIntegration();
  const deleteMutation = useDeleteIntegration();

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleOpenConfig = (provider: Provider) => {
    const active = activeIntegrations?.find(
      (i) =>
        i.provider_type === provider.type && i.provider_key === provider.key,
    );

    const initialData: Record<string, string> = {};
    provider.fields.forEach((f) => {
      if (f.section === "settings") {
        initialData[f.key] = active?.settings?.[f.key] || "";
      } else {
        // Credentials are never returned from API
        initialData[f.key] = "";
      }
    });

    setFormData(initialData);
    setSelectedProvider(provider);
  };

  const handleSave = async () => {
    if (!selectedProvider) return;

    const credentials: Record<string, string> = {};
    const settings: Record<string, string> = {};

    selectedProvider.fields.forEach((f) => {
      if (f.section === "credentials") {
        if (formData[f.key]) credentials[f.key] = formData[f.key];
      } else {
        settings[f.key] = formData[f.key];
      }
    });

    try {
      await upsertMutation.mutateAsync({
        provider_type: selectedProvider.type,
        provider_key: selectedProvider.key,
        credentials,
        settings,
      });
      toast.success(`${selectedProvider.name} integration updated`);
      setSelectedProvider(null);
    } catch (error) {
      toast.error("Failed to update integration");
    }
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm(`Are you sure you want to deactivate ${provider.name}?`))
      return;

    try {
      await deleteMutation.mutateAsync({
        provider_type: provider.type,
        provider_key: provider.key,
      });
      toast.success(`${provider.name} integration deactivated`);
    } catch (error) {
      toast.error("Failed to deactivate integration");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Blocks className="h-6 w-6" />
          Integrations
        </h1>
        <p className="text-muted-foreground">
          Connect third-party services to automate your workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_PROVIDERS.map((provider) => {
          const active = activeIntegrations?.find(
            (i) =>
              i.provider_type === provider.type &&
              i.provider_key === provider.key,
          );
          const Icon = provider.icon;

          return (
            <Card
              key={`${provider.type}-${provider.key}`}
              className="flex flex-col"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                </div>
                {active?.is_active ? (
                  <Badge
                    variant="default"
                    className="bg-green-500/10 text-green-500 border-green-500/20"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-sm mt-2">
                  {provider.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenConfig(provider)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
                {active?.is_active && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(provider)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={!!selectedProvider}
        onOpenChange={(open) => !open && setSelectedProvider(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Enter your credentials and settings for this provider.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {selectedProvider?.fields.map((field) => (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                />
                {field.section === "credentials" && (
                  <p className="text-[10px] text-muted-foreground italic">
                    Credentials are encrypted and never shown after saving.
                  </p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProvider(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
