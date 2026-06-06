"use client";

import { useState } from "react";
import { useBroadcast } from "@/hooks/use-communication";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BroadcastNoticeModal({
  propertyId,
  children,
}: {
  propertyId: string;
  children?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<"sms" | "email" | "both">("both");

  const broadcastMutation = useBroadcast();

  const handleSend = async () => {
    if (!subject || !body) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await broadcastMutation.mutateAsync({
        subject,
        body,
        channels: channel,
        property_id: propertyId,
      });
      toast.success("Broadcast sent to property residents");
      setOpen(false);
      setSubject("");
      setBody("");
    } catch (error) {
      toast.error("Failed to send broadcast");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          children || (
            <Button variant="outline" size="sm">
              <Megaphone className="mr-2 h-4 w-4" />
              Broadcast Notice
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Broadcast Notice</DialogTitle>
          <DialogDescription>
            Send a message to all residents in this property via SMS or Email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="channel">Channel</Label>
            <Select
              value={channel}
              onValueChange={(v) =>
                v && setChannel(v as "sms" | "email" | "both")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both SMS & Email</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject / Title</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubject(e.target.value)
              }
              placeholder="e.g. Scheduled Maintenance"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Message Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBody(e.target.value)
              }
              placeholder="Enter your message here..."
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={broadcastMutation.isPending}>
            {broadcastMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
