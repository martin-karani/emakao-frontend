"use client";

import { useState } from "react";
import { useBroadcastStatements } from "@/hooks/use-communication";
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
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function StatementBroadcastButton({
  propertyId,
}: {
  propertyId: string;
}) {
  const [open, setOpen] = useState(false);
  const broadcastMutation = useBroadcastStatements();

  const handleSend = async () => {
    try {
      await broadcastMutation.mutateAsync(propertyId);
      toast.success("Monthly statements broadcast initiated for all residents");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to send statements");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Monthly Statements
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Monthly Statements?</DialogTitle>
          <DialogDescription>
            This will send a detailed SMS statement to all active residents in
            this building. The message includes arrears, current rent, water,
            and garbage bills.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={broadcastMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
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
