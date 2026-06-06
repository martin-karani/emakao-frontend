"use client";

import { useState } from "react";
import {
  useNotificationTemplates,
  useUpsertNotificationTemplate,
  NotificationTemplate,
} from "@/hooks/use-notification-templates";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  Mail,
  Edit2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const SYSTEM_EVENTS = [
  {
    key: "invoice.new",
    name: "New Invoice",
    description: "Sent when a new invoice is generated",
  },
  {
    key: "billing.statement",
    name: "Monthly Statement",
    description: "The detailed monthly balance summary",
  },
  {
    key: "lease.expiry_notice",
    name: "Lease Expiry",
    description: "Sent before a lease expires",
  },
  {
    key: "maintenance.update",
    name: "Work Order Update",
    description: "Sent when a maintenance status changes",
  },
  {
    key: "manual.notice",
    name: "Manual Notice",
    description: "Template for manual broadcasts",
  },
];

export function PropertyNotificationHub({ propertyId }: { propertyId: string }) {
  const { data: templates, isLoading } = useNotificationTemplates(propertyId);
  const upsertMutation = useUpsertNotificationTemplate();

  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState({ subject: "", body: "" });

  const handleEdit = (eventKey: string, channel: "sms" | "email") => {
    const existing = templates?.find(
      (t) => t.event_key === eventKey && t.channel === channel
    );
    setEditingTemplate({
      event_key: eventKey,
      channel: channel,
      property_id: propertyId,
      body: existing?.body || "",
      subject: existing?.subject || "",
    });
    setFormData({
      subject: existing?.subject || "",
      body: existing?.body || "",
    });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    try {
      await upsertMutation.mutateAsync({
        ...editingTemplate,
        subject:
          editingTemplate.channel === "email" ? formData.subject : undefined,
        body: formData.body,
      });
      toast.success("Property template updated successfully");
      setEditingTemplate(null);
    } catch (error) {
      toast.error("Failed to update template");
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
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Overrides
        </h2>
        <p className="text-sm text-muted-foreground">
          Customise messages specifically for this property. If not set, agency defaults are used.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>SMS Override</TableHead>
              <TableHead>Email Override</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SYSTEM_EVENTS.map((event) => {
              const sms = templates?.find(
                (t) => t.event_key === event.key && t.channel === "sms"
              );
              const email = templates?.find(
                (t) => t.event_key === event.key && t.channel === "email"
              );

              return (
                <TableRow key={event.key}>
                  <TableCell className="max-w-[200px]">
                    <div className="font-medium">{event.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {sms ? (
                        <Badge
                          variant="default"
                          className="bg-green-500/10 text-green-600 border-green-500/20"
                        >
                          Overridden
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Default
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event.key, "sms")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {email ? (
                        <Badge
                          variant="default"
                          className="bg-blue-500/10 text-blue-600 border-blue-500/20"
                        >
                          Overridden
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Default
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event.key, "email")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold text-blue-800">
              Dynamic Placeholders
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Use <code>{"{{ tenant_name }}"}</code>, <code>{"{{ amount }}"}</code>,{" "}
              <code>{"{{ invoice_number }}"}</code>, and <code>{"{{ due_date }}"}</code> to
              personalize your messages. For statements, you can also use{" "}
              <code>{"{{ arrears }}"}</code>, <code>{"{{ rent }}"}</code>,{" "}
              <code>{"{{ water }}"}</code>, and <code>{"{{ garbage }}"}</code>.
            </p>
          </div>
        </div>
      </div>

      <Dialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingTemplate?.channel === "sms" ? (
                <MessageSquare className="h-5 w-5" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
              Edit {editingTemplate?.channel.toUpperCase()} Override
            </DialogTitle>
            <DialogDescription>
              Event:{" "}
              <span className="font-semibold">{editingTemplate?.event_key}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {editingTemplate?.channel === "email" && (
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Email Subject"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                placeholder="Write your template here..."
                rows={10}
              />
              <p className="text-[10px] text-muted-foreground italic">
                Templates use Jinja2/Liquid-style syntax for variables.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Property Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
